export async function validWhatsAppSignature(raw: string, signature: string | null, secret: string) {
  if (!signature || !/^sha256=[a-f0-9]{64}$/.test(signature)) return false;
  const bytes = new Uint8Array(signature.slice(7).match(/../g)!.map((part) => parseInt(part, 16)));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", key, bytes, new TextEncoder().encode(raw));
}

export type WhatsAppImage = { messageId: string; mediaId: string; caption: string };
export function incomingImages(payload: unknown, phoneId: string, allowedSenders: Set<string>): WhatsAppImage[] {
  const result: WhatsAppImage[] = [];
  const body = payload as { object?: string; entry?: Array<{ changes?: Array<{ value?: {
    metadata?: { phone_number_id?: string };
    messages?: Array<{ id?: string; from?: string; type?: string; image?: { id?: string; caption?: string } }>;
  } }> }> };
  if (body?.object !== "whatsapp_business_account" || !Array.isArray(body.entry)) return result;
  for (const entry of body.entry) {
    if (!Array.isArray(entry?.changes)) continue;
    for (const change of entry.changes) {
      const value = change?.value;
      if (value?.metadata?.phone_number_id !== phoneId || !Array.isArray(value.messages)) continue;
      for (const message of value.messages) {
        if (message?.type === "image" && message.id && message.image?.id && allowedSenders.has(message.from ?? "")) {
          result.push({ messageId: message.id, mediaId: message.image.id, caption: String(message.image.caption ?? "").slice(0, 2000) });
        }
      }
    }
  }
  return result;
}

export async function limitedBody(response: Response | Request, limit: number): Promise<Uint8Array> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Corpo mancante");
  const parts: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) throw new Error("Limite dimensione superato");
      parts.push(value);
    }
  } finally { await reader.cancel(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) { bytes.set(part, offset); offset += part.length; }
  return bytes;
}
