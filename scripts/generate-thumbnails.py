#!/usr/bin/env python3
"""Genera le miniature (640 px, WebP) per le foto auto che non ne hanno ancora una.

Da eseguire una volta dopo la migrazione 20261020100000_car_image_thumbnails.sql:

    SUPABASE_URL=https://<progetto>.supabase.co \\
    SUPABASE_SERVICE_ROLE_KEY=<chiave service role> \\
    python scripts/generate-thumbnails.py

Richiede Pillow (pip install Pillow). La chiave service role resta solo
nell'ambiente del terminale: non salvarla in file del progetto.
Lo script si può rilanciare: elabora soltanto le foto ancora senza miniatura.
"""

from __future__ import annotations

import io
import json
import os
import sys
import urllib.parse
import urllib.request

from PIL import Image, ImageOps

BUCKET = "car-image"
THUMBNAIL_SIDE = 640


def main() -> None:
    base = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not base or not key:
        sys.exit("Impostare SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.")

    headers = {"apikey": key, "Authorization": f"Bearer {key}"}

    def request(path: str, method: str = "GET", body: bytes | None = None, extra: dict | None = None):
        req = urllib.request.Request(base + path, data=body, method=method, headers={**headers, **(extra or {})})
        with urllib.request.urlopen(req, timeout=120) as response:
            return response.read()

    query = urllib.parse.urlencode({"select": "id,storage_path", "thumbnail_path": "is.null", "order": "created_at"})
    images = json.loads(request(f"/rest/v1/car_images?{query}"))
    print(f"Foto senza miniatura: {len(images)}")

    for index, image in enumerate(images, start=1):
        storage_path = image["storage_path"]
        try:
            original = request(f"/storage/v1/object/{BUCKET}/{urllib.parse.quote(storage_path)}")
            with Image.open(io.BytesIO(original)) as picture:
                picture = ImageOps.exif_transpose(picture).convert("RGB")
                picture.thumbnail((THUMBNAIL_SIDE, THUMBNAIL_SIDE))
                output = io.BytesIO()
                picture.save(output, "WEBP", quality=80, method=6)

            folder, _, name = storage_path.rpartition("/")
            stem = name.rsplit(".", 1)[0]
            thumbnail_path = f"{folder}/thumbs/{stem}-thumb.webp" if folder else f"thumbs/{stem}-thumb.webp"
            request(
                f"/storage/v1/object/{BUCKET}/{urllib.parse.quote(thumbnail_path)}",
                method="POST",
                body=output.getvalue(),
                extra={"Content-Type": "image/webp", "x-upsert": "true"},
            )
            request(
                f"/rest/v1/car_images?id=eq.{image['id']}",
                method="PATCH",
                body=json.dumps({"thumbnail_path": thumbnail_path}).encode(),
                extra={"Content-Type": "application/json", "Prefer": "return=minimal"},
            )
            print(f"[{index}/{len(images)}] {storage_path} -> {thumbnail_path}")
        except Exception as error:  # noqa: BLE001 - si prosegue con le altre foto
            print(f"[{index}/{len(images)}] ERRORE {storage_path}: {error}", file=sys.stderr)


if __name__ == "__main__":
    main()
