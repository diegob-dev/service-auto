const MAX_SIDE = 1920;
const THUMBNAIL_SIDE = 640;
// Sotto questa soglia una foto già piccola viene caricata così com'è.
const SKIP_BELOW_BYTES = 600 * 1024;

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

async function resize(file: File, maxSide: number, quality: number, suffix = "") {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") return null;

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    let blob = await canvasToBlob(canvas, "image/webp", quality);
    // Alcuni browser (es. Safari) restituiscono PNG quando WebP non è supportato.
    if (!blob || blob.type !== "image/webp") blob = await canvasToBlob(canvas, "image/jpeg", quality);
    if (!blob) return null;

    const extension = blob.type === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "") || "foto";
    return {
      scaled: scale < 1,
      file: new File([blob], `${baseName}${suffix}.${extension}`, { type: blob.type, lastModified: Date.now() }),
    };
  } catch {
    return null;
  } finally {
    bitmap?.close();
  }
}

/**
 * Ridimensiona la foto nel browser prima dell'upload (lato lungo massimo 1920 px)
 * e la converte in WebP, o in JPEG dove il browser non sa codificare WebP.
 * Se qualcosa non è supportato restituisce il file originale.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  const result = await resize(file, MAX_SIDE, 0.85);
  if (!result) return file;
  if (!result.scaled && file.size <= SKIP_BELOW_BYTES) return file;
  return result.file.size < file.size ? result.file : file;
}

/**
 * Miniatura per card e anteprime (lato lungo 640 px).
 * Restituisce null se il browser non la sa generare: si userà la foto completa.
 */
export async function createThumbnail(file: File): Promise<File | null> {
  const result = await resize(file, THUMBNAIL_SIDE, 0.8, "-thumb");
  return result?.file ?? null;
}
