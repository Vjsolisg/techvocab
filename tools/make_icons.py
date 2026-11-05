from PIL import Image, ImageDraw, ImageFont
import sys, os
out = sys.argv[1]
def font(sz):
    for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf","/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf"]:
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()
for size in (180, 192, 512):
    s = size*4
    im = Image.new("RGB", (s, s), "#080C18"); d = ImageDraw.Draw(im)
    m = s*0.14; d.rounded_rectangle([m, m, s-m, s-m], radius=s*0.08, outline="#00BFFF", width=int(s*0.035))
    d.rounded_rectangle([m+s*0.07, m+s*0.07, s-m-s*0.07, s-m-s*0.07], radius=s*0.05, fill="#0F1629")
    f = font(int(s*0.30)); t = "TV"
    bb = d.textbbox((0,0), t, font=f); w, h = bb[2]-bb[0], bb[3]-bb[1]
    d.text(((s-w)/2-bb[0], (s-h)/2-bb[1]-s*0.03), t, font=f, fill="#00BFFF")
    d.rectangle([s*0.36, s*0.68, s*0.64, s*0.70], fill="#F59E0B")
    im.resize((size, size), Image.LANCZOS).save(f"{out}/icon-{size}.png")
