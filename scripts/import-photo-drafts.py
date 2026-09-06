"""Import the reviewed local photo batch as drafts; never publish listings.

Uses the authenticated Supabase CLI. Keys stay in memory and are never logged.
Run from the project root. Deterministic IDs make interrupted imports resumable.
"""
import hashlib
import json
import subprocess
import urllib.error
import urllib.request
import uuid
from pathlib import Path

ROOT = Path('import-auto/2026-09-06')
REF = 'yjrviglirxoqsrycsuay'
BASE = f'https://{REF}.supabase.co'


def main():
    cars = json.loads((ROOT / 'auto-da-completare.json').read_text())
    for car in cars:
        for photo in car['photos']:
            assert hashlib.sha256((ROOT / photo['file']).read_bytes()).hexdigest() == photo['sha256']
    result = subprocess.run(
        ['npx', 'supabase', 'projects', 'api-keys', '--project-ref', REF, '--output', 'json'],
        capture_output=True, text=True, check=True,
    )
    key = next(k['api_key'] for k in json.loads(result.stdout) if k['name'] == 'service_role')

    def api(path, method='GET', data=None, binary=False, headers=None):
        body = data if binary else json.dumps(data).encode() if data is not None else None
        request = urllib.request.Request(BASE + path, data=body, method=method, headers={
            'apikey': key, 'Authorization': f'Bearer {key}',
            'Content-Type': 'image/jpeg' if binary else 'application/json', **(headers or {}),
        })
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                raw = response.read()
                return json.loads(raw) if raw else None
        except urllib.error.HTTPError as error:
            raise RuntimeError(f'{method} {path}: HTTP {error.code} {error.read().decode()}') from None

    receipt = []
    for car in cars:
        car_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f'service-auto/import/2026-09-06/{car["slug"]}'))
        slug = f'{car["slug"]}-import-20260906'
        existing = api(f'/rest/v1/cars?id=eq.{car_id}&select=id,status')
        if existing and existing[0]['status'] != 'draft':
            raise RuntimeError(f'{slug}: annuncio non più in bozza; importazione interrotta')
        notes = (
            'BOZZA DA COMPLETARE — foto ricevute dal venditore. '
            'Marca e modello identificati dalle immagini, da confermare. '
            'Anno da confermare. '
            'Prezzo di vendita da definire. '
            'Motorizzazione, allestimento, cambio e potenza da confermare. '
        )
        notes += (f'Chilometraggio {car["kilometers"]} letto nella foto del cruscotto, da confermare. '
                  if car['kilometers'] is not None else
                  'Chilometraggio da confermare. ')
        if not existing:
            api('/rest/v1/cars', 'POST', {
                'id': car_id, 'slug': slug, 'brand': car['brand'], 'model': car['model'],
                'description': notes, 'year': car.get('year'), 'price': car.get('price'),
                'kilometers': car['kilometers'],
                'status': 'draft', 'featured': False,
            })
        images = []
        for photo in car['photos']:
            path = f'{car_id}/{photo["sha256"]}.jpeg'
            api(f'/storage/v1/object/car-image/{path}', 'POST', (ROOT / photo['file']).read_bytes(),
                binary=True, headers={'x-upsert': 'true'})
            images.append({
                'id': str(uuid.uuid5(uuid.NAMESPACE_URL, f'service-auto/image/{path}')),
                'car_id': car_id, 'storage_path': path,
                'alt': f'{car["brand"]} {car["model"]} — foto {photo["position"] + 1}',
                'position': photo['position'], 'is_cover': photo['is_cover'],
            })
        api('/rest/v1/car_images?on_conflict=id', 'POST', images,
            headers={'Prefer': 'resolution=merge-duplicates'})
        saved = api(f'/rest/v1/car_images?car_id=eq.{car_id}&select=id,is_cover')
        assert len(saved) == len(images) and sum(p['is_cover'] for p in saved) == 1
        receipt.append({'id': car_id, 'slug': slug, 'status': 'draft', 'images': len(saved),
                        'provisional_fields': ['year', 'price'] + (['kilometers'] if car['kilometers'] is None else [])})
        (ROOT / 'import-result.json').write_text(json.dumps(receipt, indent=2))
        print(f'{car["brand"]} {car["model"]}: bozza verificata, {len(saved)} foto.', flush=True)
    print(f'Importazione completata: {len(receipt)} bozze, {sum(r["images"] for r in receipt)} foto.')


if __name__ == '__main__':
    main()
