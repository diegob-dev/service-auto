export type TelegramImage = { sourceId: string; fileId: string; caption: string; name: string; mime: string };
export function telegramImage(update: unknown, allowed: Set<string>): TelegramImage | null {
  const item = update as { message?: {
    message_id?: number; chat?: { id?: number; type?: string }; from?: { id?: number; is_bot?: boolean };
    caption?: string; photo?: { file_id: string; width: number; height: number; file_size?: number }[];
    document?: { file_id: string; file_name?: string; mime_type?: string; file_size?: number };
  } };
  const message = item?.message;
  if (message?.chat?.type !== "private" || !allowed.has(String(message.from?.id)) || message.from?.is_bot || !Number.isSafeInteger(message.message_id)) return null;
  const photo = Array.isArray(message.photo) ? [...message.photo].sort((a,b) => b.width*b.height-a.width*a.height)[0] : null;
  const document = message.document;
  const mime = photo ? "image/jpeg" : document?.mime_type ?? "";
  const fileId = photo?.file_id ?? document?.file_id;
  if (!fileId || !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(mime) || (photo?.file_size ?? document?.file_size ?? 0) > 10485760) return null;
  return { sourceId: `telegram:${message.chat.id}:${message.message_id}`, fileId,
    caption: String(message.caption ?? "").slice(0,2000), name: document?.file_name ?? "foto-telegram.jpg", mime };
}
