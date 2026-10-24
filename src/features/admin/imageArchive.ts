import { supabase } from "@/lib/supabase";
import { prepareImageForUpload, createThumbnail } from "./prepareImage";
import { parse } from "exifr";

export type ArchivedImage = {
  id: string;
  storage_path: string;
  caption: string;
  received_at: string;
  previewUrl: string;
  captured_at?: string | null;
  original_name?: string | null;
};

export async function listArchivedImages(offset = 0): Promise<ArchivedImage[]> {
  const { data, error } = await supabase.from("image_archive")
    .select("id, storage_path, caption, received_at, captured_at, original_name")
    .is("attached_at", null).is("deleted_at", null).order("received_at", { ascending: false }).order("id")
    .range(offset, offset + 49);
  if (error) throw new Error("Archivio non disponibile. " + error.message);
  return Promise.all((data ?? []).map(async (item) => {
    const { data: signed, error: signingError } = await supabase.storage.from("image-archive")
      .createSignedUrl(item.storage_path, 3600);
    if (signingError) throw new Error(signingError.message);
    return { ...item, previewUrl: signed.signedUrl };
  }));
}

export async function readCaptureDate(file: File): Promise<string | null> {
  try {
    const metadata = await parse(file, { pick: ["DateTimeOriginal", "CreateDate"], reviveValues: false });
    const raw = metadata?.DateTimeOriginal ?? metadata?.CreateDate;
    if (typeof raw !== "string") return null;
    const match = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(raw);
    if (!match) return null;
    const [, year, month, day, hour, minute, second] = match;
    const value = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    const date = new Date(value);
    if (!Number.isFinite(date.getTime()) || date.getFullYear() !== Number(year) || date.getMonth() + 1 !== Number(month) || date.getDate() !== Number(day)) return null;
    return value;
  } catch { return null; }
}

export async function deleteArchivedImage(image: ArchivedImage) {
  const { data: path, error } = await supabase.rpc("staff_discard_archive_image", { p_archive_id: image.id });
  if (error) throw new Error(error.message);
  // Keep the receipt to prevent a webhook redelivery from recreating a deleted photo.
  try { await supabase.storage.from("image-archive").remove([path]); }
  catch { /* The image is hidden; the private original can be cleaned later. */ }
}

export async function uploadArchivedImage(original: File, caption = "") {
  if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(original.type)) {
    throw new Error("Scegli una foto JPG, PNG, WebP o AVIF.");
  }
  const capturedAt = await readCaptureDate(original);
  const file = await prepareImageForUpload(original);
  if (file.size > 10 * 1024 * 1024) throw new Error("La foto supera il limite di 10 MB.");
  const id = crypto.randomUUID();
  const path = `${id}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const { error: uploadError } = await supabase.storage.from("image-archive")
    .upload(path, file, { contentType: file.type });
  if (uploadError) throw new Error(uploadError.message);
  const { error } = await supabase.from("image_archive").insert({
    id, source_message_id: `upload:${id}`, storage_path: path, caption,
    captured_at: capturedAt, original_name: original.name,
  });
  if (error) throw new Error("Foto non registrata nell’archivio. " + error.message);
}

export async function prepareArchivedImage(image: ArchivedImage, carId: string) {
  const { data: blob, error } = await supabase.storage.from("image-archive").download(image.storage_path);
  if (error) throw new Error(error.message);
  const file = await prepareImageForUpload(new File([blob], "foto.jpg", { type: blob.type }));
  const thumbnail = await createThumbnail(file);
  const key = crypto.randomUUID();
  const path = `${carId}/${key}-${file.name}`;
  const thumbnailPath = thumbnail ? `${carId}/thumbs/${key}-${thumbnail.name}` : null;
  const bucket = supabase.storage.from("car-image");
  const { error: uploadError } = await bucket.upload(path, file, { contentType: file.type });
  if (uploadError) throw new Error(uploadError.message);
  if (thumbnail && thumbnailPath) {
    const { error: thumbnailError } = await bucket.upload(thumbnailPath, thumbnail, { contentType: thumbnail.type });
    if (thumbnailError) {
      await bucket.remove([path]);
      throw new Error(thumbnailError.message);
    }
  }
  return { archive_id: image.id, storage_path: path, thumbnail_path: thumbnailPath };
}

export async function attachArchivedImage(image: ArchivedImage, carId: string) {
  const prepared = await prepareArchivedImage(image, carId);
  const { error: attachError } = await supabase.rpc("staff_attach_archive_image", {
    p_archive_id: image.id, p_car_id: carId, p_storage_path: prepared.storage_path, p_thumbnail_path: prepared.thumbnail_path,
  });
  // A lost response may follow a committed transaction: never delete the new files here.
  if (attachError) throw new Error(attachError.message);
  // The receipt remains for deduplication; the original is no longer needed.
  try { await supabase.storage.from("image-archive").remove([image.storage_path]); }
  catch { /* Association is committed; a later cleanup can remove the private original. */ }
}
