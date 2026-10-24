import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import { telegramImage } from "../_shared/telegram.ts";
import { limitedBody } from "../_shared/whatsapp.ts";

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const env = (key: string) => Deno.env.get(key)?.trim() ?? "";
  const token = env("TELEGRAM_BOT_TOKEN");
  const secret = env("TELEGRAM_WEBHOOK_SECRET");
  const allowed = new Set(env("TELEGRAM_ALLOWED_USER_IDS").split(",").map((id) => id.trim()).filter(Boolean));
  if (!token || !secret || !allowed.size) return new Response("Configuration missing", { status: 503 });
  if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== secret) return new Response("Forbidden", { status: 403 });
  try {
    const payload = JSON.parse(new TextDecoder().decode(await limitedBody(request, 1048576)));
    const image = telegramImage(payload, allowed);
    if (!image) return new Response("ok");
    const client = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
    const { data: existing, error: lookupError } = await client.from("image_archive").select("id").eq("source_message_id", image.sourceId).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) return new Response("ok");
    const result = await fetch(`https://api.telegram.org/bot${token}/getFile`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ file_id: image.fileId }), signal: AbortSignal.timeout(15000) });
    const metadata = await result.json();
    if (!result.ok || !metadata.ok || !metadata.result?.file_path) throw new Error("File unavailable");
    const filePath = String(metadata.result.file_path);
    if (filePath.includes("..") || !/^[a-zA-Z0-9_./-]+$/.test(filePath)) throw new Error("Invalid path");
    const download = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`, { redirect: "error", signal: AbortSignal.timeout(20000) });
    if (!download.ok) throw new Error("Download failed");
    const bytes = await limitedBody(download, 10485760);
    const id = crypto.randomUUID();
    const path = `${id}/${image.name.replace(/[^a-zA-Z0-9._-]/g,"-")}`;
    const bucket = client.storage.from("image-archive");
    const { error: uploadError } = await bucket.upload(path, bytes, { contentType: image.mime });
    if (uploadError) throw uploadError;
    const { error } = await client.from("image_archive").insert({ id, source_message_id: image.sourceId, storage_path: path, caption: image.caption, original_name: image.name });
    if (error) {
      if (error.code === "23505") await bucket.remove([path]);
      else throw error;
    }
    return new Response("ok");
  } catch {
    // Never log fetch errors: Telegram request URLs contain the bot credential.
    console.error("Telegram image ingestion failed; delivery can be retried.");
    return new Response("Ingestion failed", { status: 500 });
  }
});
