#!/usr/bin/env python3
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SIZE = 512
GREEN = (0, 146, 71, 255)
KRAFT = (232, 184, 128, 255)
KRAFT_TOP = (214, 154, 92, 255)
KRAFT_SIDE = (196, 138, 82, 255)
KRAFT_LINE = (168, 108, 58, 200)
TAPE = (248, 234, 198, 255)
TAPE_EDGE = (226, 204, 158, 255)
STAMP = (247, 252, 248, 255)
STAMP_INK = (10, 112, 56, 255)


def draw_box(d: ImageDraw.ImageDraw) -> None:
    front = [(88, 214), (348, 214), (348, 444), (88, 444)]
    top = [(88, 214), (348, 214), (428, 146), (168, 146)]
    side = [(348, 214), (428, 146), (428, 376), (348, 444)]
    d.polygon(top, fill=KRAFT_TOP)
    d.polygon(side, fill=KRAFT_SIDE)
    d.polygon(front, fill=KRAFT)
    d.line([(88, 214), (348, 214)], fill=KRAFT_LINE, width=4)
    d.line([(348, 214), (348, 444)], fill=KRAFT_LINE, width=3)
    d.line([(348, 214), (428, 146)], fill=KRAFT_LINE, width=3)

    # tape on front
    d.rectangle((198, 214, 238, 444), fill=TAPE)
    d.rectangle((88, 308, 348, 344), fill=TAPE)
    d.line([(198, 214), (198, 444)], fill=TAPE_EDGE, width=2)
    d.line([(238, 214), (238, 444)], fill=TAPE_EDGE, width=2)
    # tape on top (vanishing)
    d.polygon([(198, 214), (238, 214), (318, 146), (278, 146)], fill=TAPE)
    d.polygon([(348, 308), (428, 250), (428, 284), (348, 344)], fill=TAPE)


def scallop_mask(w: int, h: int, pitch=18, tooth=8) -> Image.Image:
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
    inset = 16
    sd.rounded_rectangle((inset, inset, w - inset - 1, h - inset - 1), radius=8, outline=STAMP_INK, width=4)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 78)
    except OSError:
        font = ImageFont.load_default()
    text = "$4"
    bbox = sd.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    sd.text(((w - tw) / 2, (h - th) / 2 - 8), text, font=font, fill=STAMP_INK)

    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sh = Image.new("L", (w, h), 0)
    sh.paste(mask)
    sh = sh.filter(ImageFilter.GaussianBlur(7))
    col = Image.new("RGBA", (w, h), (30, 20, 8, 80))
    shadow.paste(col, (x0 + 5, y0 + 8), sh)
    base.alpha_composite(shadow)
    base.alpha_composite(stamp, (x0, y0))


def compose() -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), GREEN)
    d = ImageDraw.Draw(img)
    d.ellipse((-60, -90, 340, 260), fill=(255, 255, 255, 22))
    d.ellipse((120, 330, 580, 640), fill=(0, 90, 42, 36))
    # box drop shadow
    sh = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sd.polygon([(100, 430), (360, 430), (430, 380), (430, 400), (348, 456), (88, 456)], fill=(20, 40, 18, 70))
    sh = sh.filter(ImageFilter.GaussianBlur(10))
    img.alpha_composite(sh)
    draw_box(d)
    draw_stamp(img, (236, 62, 468, 254))
    return img


def save_resized(src: Image.Image, path: Path, size: int) -> None:
    out = src.resize((size, size), Image.Resampling.LANCZOS)
    out.convert("RGB").save(path, "PNG", optimize=True)
    print(f"wrote {path} {size}x{size}")


def main() -> None:
    img = compose()
    for root in (Path("/workspace/public"), Path("/workspace"), Path("/workspace/github-pages")):
        root.mkdir(parents=True, exist_ok=True)
        save_resized(img, root / "icon-512.png", 512)
        save_resized(img, root / "icon-192.png", 192)
        save_resized(img, root / "apple-touch-icon.png", 180)


if __name__ == "__main__":
    main()
