#!/usr/bin/env python3
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SIZE = 512
GREEN = (0, 146, 71, 255)
KRAFT = (214, 162, 92, 255)
KRAFT_DARK = (176, 122, 58, 255)
KRAFT_LIGHT = (236, 196, 128, 255)
TAPE = (248, 232, 186, 255)
LINE = (148, 96, 42, 220)
STAMP = (247, 252, 248, 255)
STAMP_INK = (10, 112, 56, 255)


def rounded_square(size: int, radius: int, fill) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=fill)
    return img


def draw_parcel(d: ImageDraw.ImageDraw) -> None:
    front = [(70, 210), (332, 210), (332, 456), (70, 456)]
    top = [(70, 210), (332, 210), (412, 138), (150, 138)]
    side = [(332, 210), (412, 138), (412, 384), (332, 456)]
    d.polygon(top, fill=KRAFT_LIGHT)
    d.polygon(side, fill=KRAFT_DARK)
    d.polygon(front, fill=KRAFT)
    d.line([(70, 210), (332, 210)], fill=LINE, width=5)
    d.line([(332, 210), (332, 456)], fill=LINE, width=4)
    d.line([(332, 210), (412, 138)], fill=LINE, width=4)
    d.line([(150, 138), (332, 210)], fill=(168, 112, 50, 160), width=3)
    d.rectangle((178, 210, 224, 456), fill=TAPE)
    d.rectangle((70, 316, 332, 358), fill=TAPE)
    d.polygon([(178, 210), (224, 210), (304, 138), (258, 138)], fill=TAPE)
    d.polygon([(332, 316), (412, 244), (412, 286), (332, 358)], fill=TAPE)
    d.line([(70, 210), (70, 456), (332, 456), (332, 210), (70, 210)], fill=LINE, width=4)
    d.line([(150, 138), (412, 138), (412, 384)], fill=LINE, width=4)
    d.line([(70, 210), (150, 138)], fill=LINE, width=4)


def scallop_mask(w: int, h: int, pitch=16, tooth=7) -> Image.Image:
    mask = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(mask)
    md.rectangle((tooth, tooth, w - tooth - 1, h - tooth - 1), fill=255)
    for x in range(tooth, w - tooth + 1, pitch):
        md.ellipse((x - tooth, -1, x + tooth, tooth * 2 - 1), fill=255)
        md.ellipse((x - tooth, h - tooth * 2 + 1, x + tooth, h), fill=255)
    for y in range(tooth, h - tooth + 1, pitch):
        md.ellipse((-1, y - tooth, tooth * 2 - 1, y + tooth), fill=255)
        md.ellipse((w - tooth * 2 + 1, y - tooth, w, y + tooth), fill=255)
    return mask


def draw_stamp(base: Image.Image, box) -> None:
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    paper = Image.new("RGBA", (w, h), STAMP)
    wash = ImageDraw.Draw(paper)
    wash.rectangle((0, 0, w, h // 3), fill=(255, 232, 204, 255))
    wash.rectangle((0, h // 3, w, 2 * h // 3), fill=(214, 242, 224, 255))
    wash.rectangle((0, 2 * h // 3, w, h), fill=(210, 228, 255, 255))
    paper = Image.blend(Image.new("RGBA", (w, h), STAMP), paper, 0.42)
    mask = scallop_mask(w, h)
    stamp = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    stamp.paste(paper, (0, 0), mask)

    sd = ImageDraw.Draw(stamp)
    inset = 14
    sd.rounded_rectangle((inset, inset, w - inset - 1, h - inset - 1), radius=8, outline=STAMP_INK, width=4)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 64)
    except OSError:
        font = ImageFont.load_default()
    text = "$50"
    bbox = sd.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    sd.text(((w - tw) / 2, (h - th) / 2 - 6), text, font=font, fill=STAMP_INK)

    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sh = Image.new("L", (w, h), 0)
    sh.paste(mask)
    sh = sh.filter(ImageFilter.GaussianBlur(7))
    col = Image.new("RGBA", (w, h), (30, 20, 8, 80))
    shadow.paste(col, (x0 + 5, y0 + 8), sh)
    base.alpha_composite(shadow)
    base.alpha_composite(stamp, (x0, y0))


def compose() -> Image.Image:
    img = rounded_square(SIZE, 112, GREEN)
    d = ImageDraw.Draw(img)
    d.ellipse((-80, -100, 300, 240), fill=(255, 255, 255, 28))
    d.ellipse((160, 340, 600, 660), fill=(0, 90, 42, 40))
    shadow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.polygon([(86, 444), (344, 444), (420, 384), (420, 404), (332, 468), (70, 468)], fill=(20, 40, 18, 80))
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(10)))
    draw_parcel(d)
    draw_stamp(img, (248, 58, 488, 258))
    return img


def save_png(src: Image.Image, path: Path, size: int) -> None:
    out = src.resize((size, size), Image.Resampling.LANCZOS)
    out.save(path, "PNG", optimize=True)
    print(f"wrote {path} {size}x{size}")


def main() -> None:
    img = compose()
    for root in (Path("/workspace/public"), Path("/workspace"), Path("/workspace/github-pages")):
        root.mkdir(parents=True, exist_ok=True)
        save_png(img, root / "icon-512.png", 512)
        save_png(img, root / "icon-192.png", 192)
        save_png(img, root / "apple-touch-icon.png", 180)
        save_png(img, root / "favicon-32.png", 32)


if __name__ == "__main__":
    main()
