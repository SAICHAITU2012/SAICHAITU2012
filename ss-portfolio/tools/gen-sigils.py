#!/usr/bin/env python3
"""Generate the six berth sigils for THE LANTERN SEA.

Each sigil is a deterministic constellation glyph: a ring, a fainter arc,
and a star path seeded from the project id. Same palette as the site
(lantern gold + signal cyan) so the fleet reads as one chart.

    python3 tools/gen-sigils.py
"""

from __future__ import annotations

import math
import random
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets"
GOLD = "#f3b673"
GOLD_HOT = "#ffd9a3"
CYAN = "#86dbe8"

PROJECTS = ["w2s", "pi", "dna", "genui", "auto", "anime"]

VIEW = 240
CX = CY = VIEW / 2


def star_path(rng: random.Random, count: int, radius: float) -> list[tuple[float, float]]:
    """Points on a loose spiral, jittered so each sigil feels hand-plotted."""
    pts = []
    golden = math.pi * (3 - math.sqrt(5))
    for i in range(count):
        angle = i * golden + rng.uniform(-0.28, 0.28)
        r = radius * (0.30 + 0.70 * (i / max(1, count - 1))) + rng.uniform(-7, 7)
        pts.append((CX + math.cos(angle) * r, CY + math.sin(angle) * r))
    return pts


def svg(pid: str) -> str:
    rng = random.Random(f"lantern-sea:{pid}")

    count = rng.randint(7, 9)
    pts = star_path(rng, count, 82)

    # a closing chord back to the first star, like a real constellation
    poly = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts + [pts[0]])
    inner_poly = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts[1 : count - 1])

    anchor = pts[rng.randrange(len(pts))]
    arc_start = rng.uniform(0, 360)

    nodes = "\n".join(
        f'    <circle cx="{x:.1f}" cy="{y:.1f}" r="{2.6 if (x, y) == anchor else 1.7:.1f}" />'
        for x, y in pts
    )

    # faint radial ticks around the ring
    ticks = []
    for i in range(24):
        a = math.radians(i * 15)
        r1 = 104
        r2 = 108 if i % 6 == 0 else 106
        ticks.append(
            f'<line x1="{CX + math.cos(a) * r1:.1f}" y1="{CY + math.sin(a) * r1:.1f}" '
            f'x2="{CX + math.cos(a) * r2:.1f}" y2="{CY + math.sin(a) * r2:.1f}" />'
        )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VIEW} {VIEW}" width="{VIEW}" height="{VIEW}" role="img" aria-label="{pid} constellation sigil">
  <defs>
    <filter id="glow-{pid}" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="4.5" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <radialGradient id="fade-{pid}" cx="50%" cy="50%" r="50%">
      <stop offset="55%" stop-color="{CYAN}" stop-opacity="0.16" />
      <stop offset="100%" stop-color="{CYAN}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <circle cx="{CX}" cy="{CY}" r="112" fill="url(#fade-{pid})" />

  <g fill="none" stroke="{GOLD}" stroke-width="0.7" opacity="0.45">
    <circle cx="{CX}" cy="{CY}" r="104" />
  </g>
  <g fill="none" stroke="{GOLD}" stroke-width="0.6" opacity="0.28">
    {''.join(ticks)}
  </g>

  <g fill="none" stroke="{CYAN}" stroke-width="0.9" opacity="0.5">
    <path d="M {CX + math.cos(math.radians(arc_start)) * 88:.1f} {CY + math.sin(math.radians(arc_start)) * 88:.1f}
             A 88 88 0 1 1 {CX + math.cos(math.radians(arc_start + 232)) * 88:.1f} {CY + math.sin(math.radians(arc_start + 232)) * 88:.1f}" />
  </g>

  <polyline points="{poly}" fill="none" stroke="{GOLD}" stroke-width="0.85" opacity="0.62" stroke-linejoin="round" />
  <polyline points="{inner_poly}" fill="none" stroke="{CYAN}" stroke-width="0.5" opacity="0.3" stroke-dasharray="2 5" />

  <g fill="{GOLD_HOT}" filter="url(#glow-{pid})">
{nodes}
  </g>

  <g fill="none" stroke="{GOLD}" stroke-width="0.6" opacity="0.5">
    <line x1="{CX - 14}" y1="212" x2="{CX + 14}" y2="212" />
    <line x1="{CX}" y1="208" x2="{CX}" y2="216" />
  </g>
</svg>
"""


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for pid in PROJECTS:
        target = OUT / f"sigil-{pid}.svg"
        target.write_text(svg(pid), encoding="utf-8")
        print(f"wrote {target.relative_to(OUT.parent)}")


if __name__ == "__main__":
    main()
