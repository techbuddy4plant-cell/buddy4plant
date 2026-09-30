"""
Buddy4Plant - import photos for Pots & Planters and Plant Care products.

How to use
1. Save the photos into the `product-photos` folder (in the project root).
   Name each file with its code from pot-care-photo-prompts (e.g. `P12.jpg`, `C5.png`, `G3.jpg`, `p012 anything.jpg`)
   OR with the "Save as" name (e.g. `tokyo-round-planter.jpg`).
2. Run:   python scripts/import_product_photos.py
   Optional: --no-title   (do not write the product name on the photo)
3. Refresh the website - the new photos replace the stock pictures.
"""
import csv, os, re, sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC_DIR = os.path.join(ROOT, 'product-photos')
OUT_DIR = os.path.join(ROOT, 'public', 'product-photos')
PROMPTS_CSV = os.path.join(ROOT, 'pot-care-photo-prompts.csv')
CATALOGUES = [os.path.join(ROOT, 'src', 'data', f) for f in ('potCatalogue.ts', 'careCatalogue.ts', 'giftingCatalogue.ts')]
SERVICE = os.path.join(ROOT, 'src', 'services', 'productService.ts')
SIZE = 1200
ADD_TITLE = '--no-title' not in sys.argv
FONTS = ['C:/Windows/Fonts/georgiab.ttf', 'C:/Windows/Fonts/arialbd.ttf',
         '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
         '/System/Library/Fonts/Supplemental/Georgia Bold.ttf']


def font(size):
    for f in FONTS:
        if os.path.exists(f):
            return ImageFont.truetype(f, size)
    return ImageFont.load_default()


def wrap(draw, text, fnt, max_w):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=fnt) <= max_w or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    lines.append(cur)
    return lines[:2]


def process(path, name, out_path):
    im = ImageOps.exif_transpose(Image.open(path)).convert('RGB')
    im = ImageOps.fit(im, (SIZE, SIZE), Image.LANCZOS, centering=(0.5, 0.5))
    if ADD_TITLE:
        d = ImageDraw.Draw(im, 'RGBA'); f = font(52)
        lines = wrap(d, name, f, SIZE - 120)
        band = 66 * len(lines) + 46
        d.rectangle([0, SIZE - band, SIZE, SIZE], fill=(255, 255, 255, 225))
        y = SIZE - band + 26
        for ln in lines:
            d.text(((SIZE - d.textlength(ln, font=f)) / 2, y), ln, font=f, fill=(31, 59, 34)); y += 66
    im.save(out_path, 'JPEG', quality=88, optimize=True, progressive=True)


def main():
    if not os.path.isdir(SRC_DIR):
        os.makedirs(SRC_DIR); print(f'Created {SRC_DIR} - put your photos there and run again.'); return
    os.makedirs(OUT_DIR, exist_ok=True)
    codes = {}
    if os.path.exists(PROMPTS_CSV):
        for r in csv.DictReader(open(PROMPTS_CSV, encoding='utf-8')):
            codes[r['code'].upper()] = r['file_name'].rsplit('.', 1)[0]
    texts = {p: open(p, encoding='utf-8').read() for p in CATALOGUES}
    names = {}
    for p, t in texts.items():
        for name, slug in re.findall(r'name: "([^"]+)",\s*\n\s*slug: "([^"]+)"', t):
            names[slug] = (name, p)
    done, unmatched = [], []
    for fn in sorted(os.listdir(SRC_DIR)):
        stem, ext = os.path.splitext(fn)
        if ext.lower() not in ('.jpg', '.jpeg', '.png', '.webp'): continue
        slug = stem.strip().lower()
        if slug not in names:
            m = re.match(r'#?\s*([pcg])\s*0*(\d+)', slug)
            if m: slug = codes.get(f'{m.group(1).upper()}{m.group(2)}', slug)
        if slug not in names:
            unmatched.append(fn); continue
        name, cat_path = names[slug]
        process(os.path.join(SRC_DIR, fn), name, os.path.join(OUT_DIR, slug + '.jpg'))
        t = texts[cat_path]
        i = t.index(f'slug: "{slug}"')
        j = t.index('images: [', i); k = t.index(']', j)
        texts[cat_path] = t[:j] + f'images: ["/product-photos/{slug}.jpg"' + t[k:]
        done.append(slug); print(f'  {fn}  ->  {name}')
    for p, t in texts.items():
        open(p, 'w', encoding='utf-8', newline='').write(t)
    if done and os.path.exists(SERVICE):
        s = open(SERVICE, encoding='utf-8').read()
        s = re.sub(r'b4p_plant_catalogue_v(\d+)', lambda m: f'b4p_plant_catalogue_v{int(m.group(1)) + 1}', s, count=1)
        open(SERVICE, 'w', encoding='utf-8', newline='').write(s)
    left = sum(t.count('images: ["https://images.unsplash.com') for t in texts.values())
    print(f'Imported {len(done)} photo(s). {left} pots / care products still use stock pictures.')
    if unmatched:
        print('These files did not match any product (check the name):')
        for u in unmatched: print('  -', u)


if __name__ == '__main__':
    main()
