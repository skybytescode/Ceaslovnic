"""Generate site/css/david-star.svg — a tileable Star of David border.

One square tile (44 × 44) with an indigo background and a single Star of
David centred in it, drawn as two interlocking equilateral triangles in the
paper colour. The star's circumradius equals half the tile size so the top
and bottom points touch the tile edges; when the tile tiles in CSS via
background-repeat, the result is a continuous row of stars on every side of
the page frame.
"""
import math
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

TILE = 44                       # matches the CSS border-width on desktop
R = TILE / 2                    # star fills the tile vertically (touches edges)

STAR_FILL = "#fbf8ee"           # --paper
BG_FILL = "#3a4b8c"             # --accent (deep Byzantine indigo)

OUT = Path("site/css/david-star.svg")


def vertex(cx, cy, k):
    """k-th vertex (0..5) of a pointy-top regular hexagon around (cx, cy)."""
    angle = -math.pi / 2 + k * math.pi / 3
    return (cx + R * math.cos(angle), cy + R * math.sin(angle))


def build():
    cx = cy = TILE / 2
    tri_up = [vertex(cx, cy, k) for k in (0, 2, 4)]   # 90°, 210°, 330°
    tri_down = [vertex(cx, cy, k) for k in (1, 3, 5)]  # 30°, 150°, 270°
    pts = lambda v: " ".join(f"{x:g},{y:g}" for x, y in v)
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {TILE} {TILE}" width="{TILE}" height="{TILE}">\n'
        f'  <rect width="100%" height="100%" fill="{BG_FILL}"/>\n'
        f'  <g fill="{STAR_FILL}">\n'
        f'    <polygon points="{pts(tri_up)}"/>\n'
        f'    <polygon points="{pts(tri_down)}"/>\n'
        '  </g>\n'
        '</svg>\n'
    )


def main():
    svg = build()
    OUT.write_text(svg, encoding="utf-8")
    print(f"wrote {OUT} — Star of David, {TILE}×{TILE} tile, {len(svg)} chars")


if __name__ == "__main__":
    main()
