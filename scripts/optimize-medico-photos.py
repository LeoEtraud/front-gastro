#!/usr/bin/env python3
"""Gera WebP 480×600 a partir das fotos originais em public/medicos/.

Uso (na pasta front-gastro):
  python3 scripts/optimize-medico-photos.py

Os slugs abaixo devem coincidir com medicoPhotoOptimized(...) em
src/data/gastrocentro-landing.ts.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "public" / "medicos"
OUT_DIR = SRC_DIR / "optimized"

# Arquivo original (renomeado) → slug do WebP otimizado
SOURCE_TO_SLUG: dict[str, str] = {
    "BRUNO-CAMPELO.png": "bruno-campelo",
    "GLAYTON-COSTA.png": "glayton-costa",
    "JERUSA-REIS.png": "jerusa-reis",
    "JOSÉ-JUNIOR.png": "jose-junior",
    "LALILEIA.png": "lalileia",
    "ROGÉRIO-SOARES.jpeg": "rogerio-soares",
    "TIAGO-VIEIRA.jpeg": "tiago-vieira",
}

TARGET_W = 480
TARGET_H = 600


def cover_crop_top(im: Image.Image, tw: int, th: int) -> Image.Image:
    """Recorte estilo object-cover priorizando o topo (rostos)."""
    target_ratio = tw / th
    w, h = im.size
    ratio = w / h
    if ratio > target_ratio:
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        im = im.crop((left, 0, left + new_w, h))
    else:
        new_h = int(w / target_ratio)
        im = im.crop((0, 0, w, new_h))
    return im.resize((tw, th), Image.Resampling.LANCZOS)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    missing: list[str] = []

    for src_name, slug in SOURCE_TO_SLUG.items():
        src = SRC_DIR / src_name
        if not src.exists():
            missing.append(src_name)
            print(f"MISSING  {src_name}")
            continue

        im = Image.open(src).convert("RGB")
        out = cover_crop_top(im, TARGET_W, TARGET_H)
        dest = OUT_DIR / f"{slug}.webp"
        out.save(dest, "WEBP", quality=82, method=6)
        print(f"OK       {src_name} → optimized/{dest.name} ({dest.stat().st_size} bytes)")

    if missing:
        raise SystemExit(f"Falhou: {len(missing)} arquivo(s) de origem não encontrados.")

    print(f"Concluído: {len(SOURCE_TO_SLUG)} imagens em {OUT_DIR}")


if __name__ == "__main__":
    main()
