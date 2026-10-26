#!/usr/bin/env python3
"""Kese PWA görsellerini üretir (Pillow + numpy gerekir)."""

from pathlib import Path
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ICONS = ROOT / "icons"
FONT_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

MINT = (95, 227, 178)
MINT_BRIGHT = (124, 243, 196)
INK = (8, 11, 16)


def background(width, height, glow=0.22, ring=False, noise=0.9):
    """Koyu, hafif mint parıltılı arka plan."""
    y, x = np.mgrid[0:height, 0:width].astype(np.float32)
    t = np.clip((x / max(width - 1, 1)) * 0.34 + (y / max(height - 1, 1)) * 0.66, 0, 1)
    top = np.array([13, 21, 32], dtype=np.float32)
    bottom = np.array([5, 8, 12], dtype=np.float32)
    rgb = top[None, None, :] * (1 - t[..., None]) + bottom * t[..., None]

    cx, cy = width * 0.5, height * 0.44
    dx = (x - cx) / width
    dy = (y - cy) / height
    falloff = np.exp(-((dx * dx + dy * dy) / (0.36 ** 2))) * glow
    mint = np.array(MINT, dtype=np.float32)
    rgb = rgb * (1 - falloff[..., None]) + mint * falloff[..., None]

    # Çok ince gren bantlanmayı önler; büyük görsellerde düz gradyan kullanılır.
    if noise > 0:
        rng = np.random.default_rng(7)
        rgb += rng.normal(0, noise, (height, width, 1))

    # Kenarlarda hafif karartma.
    vx = np.clip((x / width - 0.5) * 2, -1, 1)
    vy = np.clip((y / height - 0.5) * 2, -1, 1)
    vignette = np.clip(np.sqrt(vx * vx + vy * vy) - 0.55, 0, 1) * 0.22
    rgb = rgb * (1 - vignette[..., None])

    img = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB").convert("RGBA")

    if ring:
        overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        d = ImageDraw.Draw(overlay)
        radius = width * 0.305
        box = (cx - radius, height * 0.43 - radius, cx + radius, height * 0.43 + radius)
        d.ellipse(box, outline=(95, 227, 178, 22), width=max(1, round(width * 0.0012)))
        img = Image.alpha_composite(img, overlay)
    return img


def cubic(p0, p1, p2, p3, steps=40):
    points = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        points.append(
            (
                u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0],
                u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1],
            )
        )
    return points


def wallet_mark(px, scale=1.0):
    """Şeffaf zemin üzerinde mint cüzdan işareti."""
    ss = 4
    size = max(64, int(px * ss))
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    u = size / 100

    ox = (100 - 100 * scale) / 2 * u
    oy = (100 - 100 * scale) / 2 * u

    def pt(x, y):
        return (ox + x * scale * u, oy + y * scale * u)

    w = max(1, round(3.15 * scale * u))
    body_box = (*pt(14, 39), *pt(86, 79))
    radius = 12 * scale * u

    d.rounded_rectangle(
        body_box,
        radius=radius,
        fill=(95, 227, 178, 16),
        outline=(*MINT_BRIGHT, 255),
        width=w,
    )

    flap = []
    flap += cubic(pt(24.5, 39), pt(24.5, 32.2), pt(26.4, 27.3), pt(33, 27.3))
    flap.append(pt(69.5, 27.3))
    flap += cubic(pt(69.5, 27.3), pt(76, 27.3), pt(77.6, 31.5), pt(77.6, 39), steps=20)[1:]
    d.line(flap, fill=(*MINT_BRIGHT, 255), width=w, joint="curve")
    cap = w / 2
    for x, y in (flap[0], flap[-1]):
        d.ellipse((x - cap, y - cap, x + cap, y + cap), fill=(*MINT_BRIGHT, 255))

    # Cüzdanın klipsi.
    clasp = (*pt(59.5, 49.5), *pt(87.5, 63.5))
    d.rounded_rectangle(
        clasp,
        radius=7 * scale * u,
        fill=(8, 13, 19, 255),
        outline=(*MINT_BRIGHT, 255),
        width=max(1, round(2.55 * scale * u)),
    )
    cx, cy = pt(76.4, 56.5)
    r = 2.15 * scale * u
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*MINT_BRIGHT, 255))

    return img.resize((px, px), Image.LANCZOS)


def add_mark(img, mark_px, center_y=None, scale=1.0):
    mark = wallet_mark(mark_px, scale=scale)
    x = round((img.width - mark_px) / 2)
    y = round((img.height - mark_px) / 2 if center_y is None else center_y - mark_px / 2)
    # Görsel ağırlık merkezi biraz aşağıda; yukarı doğru dengele.
    y -= round(mark_px * 0.030)
    img.alpha_composite(mark, (x, y))
    return img


def save_icon(size, maskable=False):
    img = background(size, size, glow=0.20)
    mark_scale = 0.68 if maskable else 0.88
    add_mark(img, round(size * mark_scale))
    if maskable:
        img.convert("RGB").save(ICONS / "icon-maskable-512.png", "PNG", optimize=True)
    else:
        img.convert("RGB").save(ICONS / f"icon-{size}.png", "PNG", optimize=True)


def tracked_text(draw, text, font, tracking, fill, center_x, y):
    widths = [draw.textlength(ch, font=font) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = center_x - total / 2
    for ch, width in zip(text, widths):
        draw.text((x, y), ch, font=font, fill=fill)
        x += width + tracking
    return total


def save_splash(width, height):
    img = background(width, height, glow=0.24, ring=True, noise=0)
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)

    mark_px = round(width * 0.335)
    mark = wallet_mark(mark_px, scale=1.0)
    mark_y = round(height * 0.355 - mark_px / 2)
    overlay.alpha_composite(mark, (round((width - mark_px) / 2), mark_y))

    title_font = ImageFont.truetype(FONT_BOLD, round(width * 0.148))
    title = "Kese"
    bbox = d.textbbox((0, 0), title, font=title_font)
    title_w = bbox[2] - bbox[0]
    title_y = round(height * 0.465)
    d.text(((width - title_w) / 2 - bbox[0], title_y), title, font=title_font, fill=(240, 248, 245, 255))

    tag_font = ImageFont.truetype(FONT_BOLD, max(18, round(width * 0.027)))
    tracked_text(
        d,
        "BORÇ TAKİBİ",
        tag_font,
        width * 0.011,
        (95, 227, 178, 225),
        width / 2,
        round(height * 0.555),
    )

    # Alt bilgi.
    foot_font = ImageFont.truetype(FONT_REGULAR, max(15, round(width * 0.022)))
    tracked_text(
        d,
        "YEREL  ·  ÇEVRİMDIŞI",
        foot_font,
        width * 0.006,
        (128, 148, 158, 190),
        width / 2,
        round(height * 0.918),
    )

    # İnce ayırıcı.
    line_w = width * 0.085
    d.line(
        (width / 2 - line_w / 2, height * 0.893, width / 2 + line_w / 2, height * 0.893),
        fill=(95, 227, 178, 70),
        width=max(1, round(width * 0.0012)),
    )

    img = Image.alpha_composite(img, overlay)
    img.convert("RGB").save(ICONS / f"splash-{width}x{height}.png", "PNG", optimize=True)


def save_favicon():
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0d1520"/>
      <stop offset="1" stop-color="#05080c"/>
    </linearGradient>
    <linearGradient id="mint" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7cf3c4"/>
      <stop offset="1" stop-color="#34d399"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="15" fill="url(#bg)"/>
  <circle cx="32" cy="30" r="22" fill="#5fe3b2" opacity=".07"/>
  <g transform="translate(8 8) scale(2)" fill="none" stroke="url(#mint)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4.5 7.6A2.6 2.6 0 0 1 7.1 5h9.2a2.2 2.2 0 0 1 2.2 2.2v.9"/>
    <rect x="2.8" y="7.3" width="18.4" height="12.1" rx="3.6"/>
    <path d="M15.8 11.6h5.4v3.9h-5.4a2 2 0 0 1 0-3.9Z"/>
    <circle cx="17" cy="13.55" r=".85" fill="url(#mint)" stroke="none"/>
  </g>
</svg>
"""
    (ICONS / "favicon.svg").write_text(svg, encoding="utf-8")


def main():
    ICONS.mkdir(exist_ok=True)
    save_icon(180)
    save_icon(192)
    save_icon(512)
    save_icon(512, maskable=True)
    save_favicon()
    save_splash(1179, 2556)
    save_splash(1290, 2796)

    for path in sorted(ICONS.iterdir()):
        print(f"{path.name:32} {path.stat().st_size / 1024:8.1f} KB")


if __name__ == "__main__":
    main()
