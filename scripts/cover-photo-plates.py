"""Apply manually reviewed plate polygons, preserving every pixel outside them.
Requires Pillow and numpy. Coordinates refer to previews scaled to width 960.
Original files are never written. Outputs are lossless PNG files.
"""
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
ROOT = Path('import-auto/2026-09-06')
def rect(x,y,r,b): return [(x,y),(r,y),(r,b),(x,b)]
MASKS = {
1:[rect(224,51,241,57)],
5:[[(33,81),(59,74),(64,91),(37,100)]],
14:[rect(744,74,764,83),[(788,78),(804,80),(803,86),(787,84)]],
16:[[(49,135),(68,128),(70,144),(50,151)]],
17:[[(101,49),(125,40),(129,57),(102,65)]],
20:[rect(245,116,272,126)],
22:[[(154,1340),(241,1320),(278,1340),(324,1345),(157,1381)]],
23:[[(830,386),(879,341),(883,378),(833,427)]],
24:[[(358,958),(619,966),(614,1036),(358,1027)]],
30:[rect(378,103,390,109),rect(429,109,441,115)],
33:[rect(104,66,122,74)],
34:[rect(430,30,448,37),rect(384,28,400,35)],
40:[[(279,210),(471,240),(462,289),(269,258)],rect(887,93,934,111)],
41:[[(731,267),(875,242),(887,289),(742,317)]],
43:[[(556,359),(683,347),(681,391),(555,404)]],
48:[rect(207,116,219,129)],
51:[[(-4,9),(67,-5),(77,23),(-4,42)]],
54:[[(328,459),(546,467),(546,532),(328,519)],rect(28,38,43,44)],
60:[rect(840,42,864,52),rect(889,49,921,62)],
61:[rect(646,91,663,99)],
64:[rect(58,132,78,139)],
74:[rect(200,127,218,135),rect(138,127,153,135)],
76:[[(917,297),(938,272),(929,310),(916,326)]],
85:[rect(46,136,70,144),rect(143,135,161,142)],
}

def main():
 outdir=ROOT/'foto-targhe-python';outdir.mkdir(exist_ok=True)
 panel=Image.new('RGB',(1040,240),(15,49,130));d=ImageDraw.Draw(panel)
 font='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
 for word,y,size in [('SERVICE',61,98),('VIGEVANO',174,74)]:
  d.text((520,y),word,font=ImageFont.truetype(font,size),fill='white',anchor='mm')
 report=[]
 for n,polys in MASKS.items():
  if len(sys.argv)>1 and str(n) not in sys.argv[1:]: continue
  original=Image.open(ROOT/f'originali/{n:03}.jpeg').convert('RGB');result=original.copy()
  union=Image.new('L',original.size);scale=original.width/960
  for poly in polys:
   pts=[(round(x*scale),round(y*scale)) for x,y in poly]
   mask=Image.new('L',original.size);ImageDraw.Draw(mask).polygon(pts,fill=255)
   ImageDraw.Draw(union).polygon(pts,fill=255)
   quad=pts if len(pts)==4 else [(min(x for x,y in pts),min(y for x,y in pts)),(max(x for x,y in pts),min(y for x,y in pts)),(max(x for x,y in pts),max(y for x,y in pts)),(min(x for x,y in pts),max(y for x,y in pts))]
   a=[];b=[]
   for (x,y),(u,v) in zip(quad,[(0,0),(1039,0),(1039,239),(0,239)]):
    a.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]]);b.extend([u,v])
   coeff=np.linalg.solve(a,b)
   warped=panel.transform(original.size,Image.Transform.PERSPECTIVE,coeff,Image.Resampling.BICUBIC)
   result.paste(warped,(0,0),mask)
  dest=outdir/f'{n:03}.png';result.save(dest,optimize=True)
  saved=np.asarray(Image.open(dest));src=np.asarray(original);outside=np.asarray(union)==0
  assert np.array_equal(saved[outside],src[outside]),n
  report.append({'source_id':n,'file':str(dest),'regions':len(polys),'outside_pixels_identical':True})
  preview=result.copy();preview.thumbnail((960,1707));preview.save(outdir/f'{n:03}-preview.png')
 if len(sys.argv)>1:
  prior=json.loads((outdir/'verification.json').read_text());report=[r for r in prior if str(r['source_id']) not in sys.argv[1:]]+report
 (outdir/'verification.json').write_text(json.dumps(report,indent=2))
 print(f'{len(report)} images, {sum(r["regions"] for r in report)} regions; outside pixels verified identical.')
if __name__=='__main__': main()
