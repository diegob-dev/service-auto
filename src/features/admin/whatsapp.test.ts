import { webcrypto } from "node:crypto";
import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import { incomingImages, limitedBody, validWhatsAppSignature } from "../../../supabase/functions/_shared/whatsapp";

describe("WhatsApp webhook", () => {
  beforeAll(() => vi.stubGlobal("crypto", webcrypto));
  afterAll(() => vi.unstubAllGlobals());
  it("verifica la firma sul corpo originale e rifiuta firme mancanti o alterate", async () => {
    const body = '{"object":"whatsapp_business_account"}';
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode("secret"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    const signature = "sha256=" + Buffer.from(digest).toString("hex");
    expect(await validWhatsAppSignature(body, signature, "secret")).toBe(true);
    expect(await validWhatsAppSignature(body + " ", signature, "secret")).toBe(false);
    expect(await validWhatsAppSignature(body, null, "secret")).toBe(false);
    expect(await validWhatsAppSignature(body, "sha256=00", "secret")).toBe(false);
  });

  it("accetta solo immagini da mittenti autorizzati sul numero configurato", () => {
    const payload = { object: "whatsapp_business_account", entry: [{ changes: [{ value: {
      metadata: { phone_number_id: "phone" }, messages: [
        { id: "m1", from: "39333", type: "image", image: { id: "media", caption: "Volvo" } },
        { id: "m2", from: "unknown", type: "image", image: { id: "media2" } },
        { id: "m3", from: "39333", type: "text" },
      ],
    } }] }] };
    expect(incomingImages(payload, "phone", new Set(["39333"]))).toEqual([{ messageId: "m1", mediaId: "media", caption: "Volvo" }]);
    expect(incomingImages(payload, "other", new Set(["39333"]))).toEqual([]);
    expect(incomingImages(null, "phone", new Set())).toEqual([]);
  });

  it("interrompe i download oltre il limite anche senza Content-Length", async () => {
    await expect(limitedBody(new Response("12345"), 4)).rejects.toThrow("Limite");
    expect(Array.from(await limitedBody(new Response("1234"), 4))).toEqual([49, 50, 51, 52]);
  });
});
