"""Zet de originelen uit bronfoto/ om naar WebP in assets/img/. Gebruik: python tools/optimize-photos.py"""
import os
from PIL import Image, ImageOps

SRC = os.path.join(os.path.dirname(__file__), "..", "bronfoto")
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "img")
# naam: (bronbestand, [breedtes])
PHOTOS = {
    "maatwerk-bed": ("maatwerk-bed.jpeg", [900, 1672]),
    "trap-eiken-voor": ("6a.jpg", [640, 1000]),
    "trap-eiken-tussen": ("6b.jpg", [640, 1000]),
    "trap-eiken-na": ("6c.jpg", [640, 1000]),
    "trap-donker-voor": ("9a.jpg", [640, 1000]),
    "trap-donker-tussen": ("9b.jpg", [640, 1000]),
    "trap-donker-na": ("9c.jpg", [640, 1000]),
    "trap-wit-voor": ("1a.jpg", [640, 1000]),
    "trap-wit-na": ("1b.jpg", [640, 1000]),
    "bad-dakschuin-voor": ("8a.jpg", [800, 1400]),
    "bad-dakschuin-na": ("8b.jpg", [640, 1000]),
    "badkamer-ligbad": ("7a.jpg", [640, 960]),
    "badkamer-meubel": ("7b.jpg", [640, 720]),
    "badkamer-douche": ("7c.jpg", [640, 720]),
    "badkamer-vloer": ("7e.jpg", [640, 960]),
    "tuinhuis-start": ("5a.jpg", [640, 1000]),
    "tuinhuis-fundering": ("5b.jpg", [640, 1000]),
    "tuinhuis-casco": ("5c.jpg", [800, 1400]),
    "tuinhuis-dak": ("5d.jpg", [800, 1400]),
    "tuinhuis-klaar": ("5e.jpg", [640, 1000]),
    "kast-schuifdeuren": ("2b.jpg", [640, 768]),
    "hero-timmerman": (os.path.join("stock", "pexels-374861-timmerman-schaaf.jpg"), [960, 1920]),
}
# gegenereerde hero-sfeerbeelden (tools/generate-hero.mjs), alleen als ze er zijn
GEN = os.path.join(SRC, "gegenereerd")
for n in ("hero-1", "hero-2"):
    for ext in ("png", "jpg"):
        if os.path.exists(os.path.join(GEN, f"{n}.{ext}")):
            PHOTOS[n] = (os.path.join("gegenereerd", f"{n}.{ext}"), [640, 1000])
os.makedirs(OUT, exist_ok=True)
total = 0
for name, (src, widths) in PHOTOS.items():
    im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, src))).convert("RGB")
    for w in widths:
        if w > im.width:
            w = im.width
        h = round(im.height * w / im.width)
        path = os.path.join(OUT, f"{name}-{w}.webp")
        im.resize((w, h), Image.LANCZOS).save(path, "WEBP", quality=78, method=6)
        total += os.path.getsize(path)
        print(f"{name}-{w}.webp  {w}x{h}")
print(f"totaal {total/1024:.0f} KB")
