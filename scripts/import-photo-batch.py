#!/usr/bin/env python3
"""Import the prepared 2026-09-09 vehicle batch into Supabase."""

from __future__ import annotations

import hashlib
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BATCH = ROOT / "import-auto" / "2026-09-09"
MANIFEST = BATCH / "auto-da-pubblicare.json"
RECEIPT = BATCH / "import-result.json"
REF = "yjrviglirxoqsrycsuay"
BASE = f"https://{REF}.supabase.co"


def main() -> None:
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not key:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY non impostata")

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    cars = manifest["cars"]
    if manifest["summary"] != {
        "cars": len(cars),
        "photos": sum(len(car["photos"]) for car in cars),
    }:
        raise RuntimeError("Riepilogo del manifesto non coerente")

    for car in cars:
        for photo in car["photos"]:
            local_path = ROOT / photo["file"]
            digest = hashlib.sha256(local_path.read_bytes()).hexdigest()
            if digest != photo["sha256"]:
                raise RuntimeError(f"File modificato dopo la revisione: {local_path}")

    def api(path: str, method: str = "GET", data=None, *, binary=False, headers=None):
        body = data if binary else json.dumps(data).encode() if data is not None else None
        for attempt in range(5):
            request = urllib.request.Request(
                BASE + path,
                data=body,
                method=method,
                headers={
                    "apikey": key,
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "image/jpeg" if binary else "application/json",
                    **(headers or {}),
                },
            )
            try:
                with urllib.request.urlopen(request, timeout=90) as response:
                    raw = response.read()
                    return json.loads(raw) if raw else None
            except urllib.error.HTTPError as error:
                detail = error.read().decode(errors="replace")
                if error.code not in {429, 500, 502, 503, 504} or attempt == 4:
                    raise RuntimeError(f"{method} {path}: HTTP {error.code} {detail}") from None
            except (urllib.error.URLError, ConnectionError):
                if attempt == 4:
                    raise
            time.sleep(2 ** attempt)
        raise RuntimeError(f"{method} {path}: numero massimo di tentativi superato")

    receipt = []
    for car in cars:
        car_id = car["id"]
        car_payload = {
            key_name: car.get(key_name)
            for key_name in (
                "id", "slug", "brand", "model", "version", "description", "year",
                "kilometers", "price", "fuel", "transmission", "color", "power_cv",
                "optional_features",
            )
        }
        car_payload.update({"status": "published", "featured": False})
        api(
            "/rest/v1/cars?on_conflict=id",
            "POST",
            car_payload,
            headers={"Prefer": "resolution=merge-duplicates"},
        )

        images = []
        for photo in car["photos"]:
            local_path = ROOT / photo["file"]
            storage_path = f'{car_id}/{photo["sha256"]}.jpeg'
            quoted_path = urllib.parse.quote(storage_path, safe="/")
            api(
                f"/storage/v1/object/car-image/{quoted_path}",
                "POST",
                local_path.read_bytes(),
                binary=True,
                headers={"x-upsert": "true"},
            )
            image_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"service-auto/image/{storage_path}"))
            images.append(
                {
                    "id": image_id,
                    "car_id": car_id,
                    "storage_path": storage_path,
                    "alt": f'{car["brand"]} {car["model"]} — foto {photo["position"] + 1}',
                    "position": photo["position"],
                    "is_cover": photo["is_primary"],
                }
            )

        api(
            "/rest/v1/car_images?on_conflict=id",
            "POST",
            images,
            headers={"Prefer": "resolution=merge-duplicates"},
        )
        saved = api(
            f"/rest/v1/car_images?car_id=eq.{car_id}&select=id,is_cover,position&order=position.asc"
        )
        if len(saved) != len(images) or sum(bool(item["is_cover"]) for item in saved) != 1:
            raise RuntimeError(f'{car["brand"]} {car["model"]}: verifica immagini fallita')

        item = {
            "id": car_id,
            "slug": car["slug"],
            "status": "published",
            "images": len(saved),
        }
        receipt.append(item)
        RECEIPT.write_text(json.dumps(receipt, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f'{car["brand"]} {car["model"]}: pubblicata con {len(saved)} foto.', flush=True)

    print(f'Importazione completata: {len(receipt)} auto e {sum(x["images"] for x in receipt)} foto.')


if __name__ == "__main__":
    main()
