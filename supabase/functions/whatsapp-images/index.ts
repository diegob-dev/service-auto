import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import { incomingImages, limitedBody, validWhatsAppSignature } from "../_shared/whatsapp.ts";

// Meta authenticates POST requests with its HMAC signature, rather than a Supabase JWT.
Deno.serve(async (request) => {
  const env = (name: string) => Deno.env.get(name)?.trim() ?? "";
  const verifyToken = env("WHATSAPP_VERIFY_TOKEN");
  if (request.method === "GET") {
    const query = new URL(request.url).searchParams;
    return verifyToken && query.get("hub.mode") === "subscribe" && query.get("hub.verify_token") === verifyToken
      ? new Response(query.get("hub.challenge"), { headers: { "Content-Type": "text/plain" } })
      : new Response("Forbidden", { status: 403 });
  }
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const secret = env("WHATSAPP_APP_SECRET");
  const token = env("WHATSAPP_ACCESS_TOKEN");
  const phoneId = env("WHATSAPP_PHONE_NUMBER_ID");
  const version = env("WHATSAPP_GRAPH_VERSION");
  const senders = new Set(env("WHATSAPP_ALLOWED_SENDERS").split(",").map((item) => item.trim()).filter(Boolean));
  if (!secret || !token || !phoneId || !/^v\d+\.\d+$/.test(version) || !senders.size || !env("SUPABASE_URL") || !env("SUPABASE_SERVICE_ROLE_KEY")) {
    return new Response("Configuration missing", { status: 503 });
  }
  let raw: string;
  try { raw = new TextDecoder().decode(await limitedBody(request, 1024 * 1024)); }
  catch { return new Response("Payload too large", { status: 413 }); }
  if (!await validWhatsAppSignature(raw, request.headers.get("x-hub-signature-256"), secret)) {
    return new Response("Forbidden", { status: 403 });
  }
  let payload: unknown;
  try { payload = JSON.parse(raw); }
  catch { return new Response("Invalid JSON", { status: 400 }); }
  const client = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
  try {
    for (const image of incomingImages(payload, phoneId, senders)) {
      const { data: existing, error: lookupError } = await client.from("image_archive")
        .select("id").eq("source_message_id", image.messageId).maybeSingle();
      if (lookupError) throw lookupError;
      if (existing) continue;
      const headers = { Authorization: `Bearer ${token}` };
      const metadataResponse = await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(image.mediaId)}?phone_number_id=${encodeURIComponent(phoneId)}`,
        { headers, signal: AbortSignal.timeout(15000) });
      if (!metadataResponse.ok) throw new Error("Media metadata unavailable");
      const media = await metadataResponse.json();
      const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string, string>)[media.mime_type];
      if (!extension || Number(media.file_size) > 10485760) continue;
      const mediaUrl = new URL(media.url);
      if (mediaUrl.protocol !== "https:" || !(mediaUrl.hostname.endsWith(".facebook.com") || mediaUrl.hostname.endsWith(".fbcdn.net") || mediaUrl.hostname.endsWith(".fbsbx.com"))) {
        throw new Error("Unexpected media host");
      }
      const download = await fetch(mediaUrl, { headers, redirect: "error", signal: AbortSignal.timeout(20000) });
      if (!download.ok) throw new Error("Media download failed");
      const bytes = await limitedBody(download, 10485760);
      const id = crypto.randomUUID();
      const path = `${id}.${extension}`;
      const bucket = client.storage.from("image-archive");
      const { error: uploadError } = await bucket.upload(path, bytes, { contentType: media.mime_type });
      if (uploadError) throw uploadError;
      const { error: insertError } = await client.from("image_archive").insert({
        id, source_message_id: image.messageId, storage_path: path, caption: image.caption,
      });
      if (insertError) {
        // Only remove for a definite duplicate; an ambiguous failure may have committed.
        if (insertError.code === "23505") await bucket.remove([path]);
        else throw insertError;
      }
    }
    return new Response("ok");
  } catch {
    console.error("WhatsApp image ingestion failed; delivery can be retried.");
    return new Response("Image ingestion failed", { status: 500 });
  }
});
