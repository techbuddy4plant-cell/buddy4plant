"""
Buddy4Plant - import plant photos into the store.

How to use
1. Save your plant photos into the `plant-photos` folder (in the project root).
   Name each file EITHER like the "Save as" name (e.g. `peace-lily-plant.jpg`)
   OR just with its number from the photo list (e.g. `7.png`, `007.jpg`, `7 zz plant.png`).
   Or keep the downloaded names and run with  --from 1  : files are matched in the
   order you downloaded them (oldest first) starting from item 1.
2. Run:   python scripts/import_plant_photos.py
   Optional: --no-title   (do not write the plant name on the photo)
3. Refresh the website - the new photos replace the drawn cards.

What it does
- crops every photo to a square and saves an HD 1200x1200 JPG in public/plant-photos/
- writes the plant name in a clean band at the bottom (unless --no-title)
- points the product in src/data/plantCatalogue.ts to the new photo
- bumps the catalogue version so every browser picks up the new images
"""
import os, re, sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC_DIR = os.path.join(ROOT, 'plant-photos')
OUT_DIR = os.path.join(ROOT, 'public', 'plant-photos')
CATALOGUE = os.path.join(ROOT, 'src', 'data', 'plantCatalogue.ts')
SERVICE = os.path.join(ROOT, 'src', 'services', 'productService.ts')
SIZE = 1200
PROMPTS_CSV = os.path.join(ROOT, 'plant-photo-prompts.csv')
ADD_TITLE = '--no-title' not in sys.argv
FONT_CANDIDATES = [
    'C:/Windows/Fonts/georgiab.ttf', 'C:/Windows/Fonts/arialbd.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/System/Library/Fonts/Supplemental/Georgia Bold.ttf',
]

def font(size):
    for f in FONT_CANDIDATES:
        if os.path.exists(f):
            return ImageFont.truetype(f, size)
    return ImageFont.load_default()

def wrap(draw, text, fnt, max_w):
    words, lines, cur = text.split(), [], ''
    for w in words:
        test = (cur + ' ' + w).strip()
        if draw.textlength(test, font=fnt) <= max_w or not cur:
            cur = test
        else:
            lines.append(cur); cur = w
    lines.append(cur)
    return lines[:2]

def process(path, name, out_path):
    im = Image.open(path)
    im = ImageOps.exif_transpose(im).convert('RGB')
    im = ImageOps.fit(im, (SIZE, SIZE), Image.LANCZOS, centering=(0.5, 0.45))
    if ADD_TITLE:
        draw = ImageDraw.Draw(im, 'RGBA')
        fnt = font(56)
        lines = wrap(draw, name, fnt, SIZE - 120)
        band = 70 * len(lines) + 50
        draw.rectangle([0, SIZE - band, SIZE, SIZE], fill=(255, 255, 255, 225))
        y = SIZE - band + 28
        for ln in lines:
            w = draw.textlength(ln, font=fnt)
            draw.text(((SIZE - w) / 2, y), ln, font=fnt, fill=(31, 59, 34))
            y += 70
        small = font(30)
        draw.text((36, 30), 'buddy4plant', font=small, fill=(255, 255, 255, 230))
    im.save(out_path, 'JPEG', quality=88, optimize=True, progressive=True)

def main():
    if not os.path.isdir(SRC_DIR):
        os.makedirs(SRC_DIR)
        print(f'Created {SRC_DIR} - put your photos there and run again.')
        return
    os.makedirs(OUT_DIR, exist_ok=True)
    cat = open(CATALOGUE, encoding='utf-8').read()
    products = dict(re.findall(r'name: "([^"]+)",\s*\n\s*slug: "([^"]+)"', cat))
    slug_to_name = {v: k for k, v in products.items()}
    import csv
    order = []
    if os.path.exists(PROMPTS_CSV):
        order = [r['file_name'].rsplit('.', 1)[0] for r in csv.DictReader(open(PROMPTS_CSV, encoding='utf-8'))]
    files = [f for f in os.listdir(SRC_DIR) if os.path.splitext(f)[1].lower() in ('.jpg', '.jpeg', '.png', '.webp')]
    by_order = {}
    if '--from' in sys.argv:
        start = int(sys.argv[sys.argv.index('--from') + 1])
        named = [f for f in files if os.path.splitext(f)[0].strip().lower() not in slug_to_name]
        named.sort(key=lambda f: os.path.getmtime(os.path.join(SRC_DIR, f)))
        for k, f in enumerate(named):
            if 0 <= start - 1 + k < len(order): by_order[f] = order[start - 1 + k]
    done, unmatched = [], []
    for fn in sorted(files):
        stem, ext = os.path.splitext(fn)
        slug = stem.strip().lower()
        if slug not in slug_to_name:
            m = re.match(r'#?\s*0*(\d+)', slug)
            if fn in by_order:
                slug = by_order[fn]
            elif m and 1 <= int(m.group(1)) <= len(order):
                slug = order[int(m.group(1)) - 1]
        if slug not in slug_to_name:
            unmatched.append(fn); continue
        if slug not in slug_to_name:
            unmatched.append(fn); continue
        process(os.path.join(SRC_DIR, fn), slug_to_name[slug], os.path.join(OUT_DIR, slug + '.jpg'))
        print(f'  {fn}  ->  {slug_to_name[slug]}')
        cat = re.sub(r'images: \["/plant-(?:cards|photos)/' + re.escape(slug) + r'\.(?:svg|jpg)"\]',
                     f'images: ["/plant-photos/{slug}.jpg"]', cat)
        done.append(slug)
    open(CATALOGUE, 'w', encoding='utf-8', newline='').write(cat)
    if done and os.path.exists(SERVICE):
        s = open(SERVICE, encoding='utf-8').read()
        s = re.sub(r"b4p_plant_catalogue_v(\d+)", lambda m: f"b4p_plant_catalogue_v{int(m.group(1)) + 1}", s, count=1)
        open(SERVICE, 'w', encoding='utf-8', newline='').write(s)
    remaining = [s for s in slug_to_name if f'/plant-cards/{s}.svg' in cat]
    print(f'Imported {len(done)} photo(s).')
    if unmatched:
        print('These files did not match any product (check the file name):')
        for u in unmatched: print('  -', u)
    print(f'{len(remaining)} plants still use the drawn card.')

if __name__ == '__main__':
    main()
