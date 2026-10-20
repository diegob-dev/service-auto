"""Upload verified plate edits, switch photo references, remove public originals.
Original JPEGs remain in the local archive. Credentials are never logged.
"""
import hashlib,json,subprocess,urllib.request,urllib.error,uuid
from pathlib import Path
ROOT=Path('import-auto/2026-09-06');REF='yjrviglirxoqsrycsuay';BASE=f'https://{REF}.supabase.co'
def main():
 verified=json.loads((ROOT/'foto-targhe-python/verification.json').read_text())
 result=subprocess.run(['npx','supabase','projects','api-keys','--project-ref',REF,'--output','json'],capture_output=True,text=True,check=True)
 key=next(k['api_key'] for k in json.loads(result.stdout) if k['name']=='service_role')
 def api(path,method='GET',data=None,binary=False):
  body=data if binary else json.dumps(data).encode() if data is not None else None
  req=urllib.request.Request(BASE+path,data=body,method=method,headers={'apikey':key,'Authorization':f'Bearer {key}','Content-Type':'image/png' if binary else 'application/json','x-upsert':'true'})
  with urllib.request.urlopen(req,timeout=60) as response:
   raw=response.read();return json.loads(raw) if raw else None
 photos={p['source_id']:(c,p) for c in json.loads((ROOT/'auto-da-completare.json').read_text()) for p in c['photos']}
 before=api('/rest/v1/car_images?select=*');(ROOT/'plates-db-backup.json').write_text(json.dumps(before,indent=2)) if not (ROOT/'plates-db-backup.json').exists() else None
 receipt=[]
 for edit in verified:
  assert edit['outside_pixels_identical']
  c,p=photos[edit['source_id']];car_id=str(uuid.uuid5(uuid.NAMESPACE_URL,f'service-auto/import/2026-09-06/{c["slug"]}'))
  old=f'{car_id}/{p["sha256"]}.jpeg';image_id=str(uuid.uuid5(uuid.NAMESPACE_URL,f'service-auto/image/{old}'))
  data=Path(edit['file']).read_bytes();new=f'{car_id}/service-vigevano-{hashlib.sha256(data).hexdigest()[:24]}.png'
  row=api(f'/rest/v1/car_images?id=eq.{image_id}&select=*');assert len(row)==1 and row[0]['storage_path'] in (old,new)
  api('/storage/v1/object/car-image/'+new,'POST',data,True)
  with urllib.request.urlopen(BASE+'/storage/v1/object/public/car-image/'+new,timeout=60) as response: assert response.read()==data
  api(f'/rest/v1/car_images?id=eq.{image_id}','PATCH',{'storage_path':new})
  api('/storage/v1/object/car-image','DELETE',{'prefixes':[old]})
  try:
   with urllib.request.urlopen(BASE+'/storage/v1/object/public/car-image/'+old+'?verify_removed=20260906',timeout=60) as response:
    raise RuntimeError('Original image remains publicly accessible')
  except urllib.error.HTTPError as error:
   assert error.code in (400,404),error.code
  receipt.append({'source_id':edit['source_id'],'id':image_id,'old':old,'new':new,'sha256':hashlib.sha256(data).hexdigest()})
  (ROOT/'plates-publish-result.json').write_text(json.dumps(receipt,indent=2));print(f'Foto {edit["source_id"]}: aggiornata e verificata.',flush=True)
 after=api('/rest/v1/car_images?select=*');assert len(after)==len(before)==84
 for a in after:
  b=next(b for b in before if b['id']==a['id']);assert (a['is_cover'],a['position'],a['car_id'])==(b['is_cover'],b['position'],b['car_id'])
 print('84 riferimenti conservati, ordine e copertine invariati; sostituzione completata.')
if __name__=='__main__':main()
