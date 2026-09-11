#!/usr/bin/env python3
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

SIZE = 512
GREEN = (0, 146, 71, 255)
KRAFT = (214, 162, 92, 255)
KRAFT_DARK = (176, 122, 58, 255)
KRAFT_LIGHT = (236, 196, 128, 255)
FLAP = (198, 146, 78, 255)
TAPE = (248, 232, 186, 255)
LINE = (148, 96, 42, 220)


def rounded_square(size: int, radius: int, fill) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=fill)
    return img


def draw_parcel(d: ImageDraw.ImageDraw) -> None:
    # Closed carton, 📦-style, filling the icon.
    front = [(86, 188), (348, 188), (348, 442), (86, 442)]
    top = [(86, 188), (348, 188), (426, 118), (164, 118)]
    side = [(348, 188), (426, 118), (426, 372), (348, 442)]
    d.polygon(top, fill=KRAFT_LIGHT)
    d.polygon(side, fill=KRAFT_DARK)
    d.polygon(front, fill=KRAFT)
    d.line([(86, 188), (348, 188)], fill=LINE, width=5)
    d.line([(348, 188), (348, 442)], fill=LINE, width=4)
    d.line([(348, 188), (426, 118)], fill=LINE, width=4)

    # lid crease
    d.line([(164, 118), (348, 188)], fill=(168, 112, 50, 160), width=3)

    # packing tape cross on front
    d.rectangle((196, 188, 238, 442), fill=TAPE)
    d.rectangle((86, 296, 348, 338), fill=TAPE)
    # tape on top + side
    d.polygon([(196, 188), (238, 188), (316, 118), (274, 118)], fill=TAPE)
    d.polygon([(348, 296), (426, 226), (426, 268), (348, 338)], fill=TAPE)

    # outline
    d.line([(86, 188), (86, 442), (348, 442), (348, 188), (86, 188)], fill=LINE, width=4)
    d.line([(164, 118), (426, 118), (426, 372)], fill=LINE, width=4)
    d.line([(86, 188), (164, 118)], fill=LINE, width=4)


def compose() -> Image.Image:
    img = rounded_square(SIZE, 112, GREEN)
    d = ImageDraw.Draw(img)
    d.ellipse((-80, -100, 300, 240), fill=(255, 255, 255, 28))
    d.ellipse((160, 340, 600, 660), fill=(0, 90, 42, 40))
    shadow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.polygon([(100, 430), (360, 430), (434, 372), (434, 392), (348, 456), (86, 456)], fill=(20, 40, 18, 80))
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(10)))
    draw_parcel(d)
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
