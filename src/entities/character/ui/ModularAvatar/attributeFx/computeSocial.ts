/**
 * Social — constellation behind the avatar (canvas space). Nothing is drawn on the body.
 * fxStep(v, 8) stars outside the silhouette hull (+8px), in the top 70% of the canvas, seeded positions,
 * ≥24px apart, ≥12px away from the crystal orbit (and from the crystals themselves).
 * Threads: minimum spanning tree over the stars; the star nearest to the avatar is linked to the
 * chest point (that thread runs behind the body — the whole Social layer is under the asset).
 */

import { distToOutline, pointInPoly, type Pt } from "./anatomy";
import { computeDisciplineCrystals } from "./computeDiscipline";
import { FX_CANVAS, type FxContext } from "./fxContext";
import { fxRng, fxStep } from "./fxSeed";

export interface Constellation {
  requested: number;
  stars: Array<{ p: Pt; r: number }>;
  threads: Array<[Pt, Pt]>;
  chestLink: [Pt, Pt] | null;
}

const HULL_MARGIN = 8;
const ORBIT_MARGIN = 12;
const EDGE_MARGIN = 6;

export function computeSocialConstellation(ctx: FxContext): Constellation | null {
  const n = fxStep(ctx.values.social, 8);
  if (n === 0) return null;
  const rng = fxRng(ctx.seedKey, "social");
  const hull = ctx.geo.silhouetteHull.map(ctx.toCanvas);
  const chest = ctx.toCanvas(ctx.geo.chestPoint);
  const crystals = computeDisciplineCrystals(ctx);
  const maxY = FX_CANVAS.h * 0.7;

  const clearOfCrystals = (p: Pt): boolean => {
    if (!crystals) return true;
    const d = Math.hypot(p[0] - crystals.center[0], p[1] - crystals.center[1]);
    if (Math.abs(d - crystals.orbitRadius) < ORBIT_MARGIN) return false;
    return crystals.crystals.every(
      (c) => Math.hypot(p[0] - c.p[0], p[1] - c.p[1]) >= ORBIT_MARGIN + crystals.crystalSize,
    );
  };
  const valid = (p: Pt): boolean =>
    !pointInPoly(p[0], p[1], hull) && distToOutline(p, hull) >= HULL_MARGIN && clearOfCrystals(p);

  const stars: Array<{ p: Pt; r: number }> = [];
  for (const minSep of [24, 20, 16]) {
    for (let attempt = 0; attempt < 600 && stars.length < n; attempt++) {
      const p: Pt = [
        EDGE_MARGIN + rng() * (FX_CANVAS.w - 2 * EDGE_MARGIN),
        EDGE_MARGIN + rng() * (maxY - EDGE_MARGIN),
      ];
      const r = 1.5 + rng();
      if (!valid(p)) continue;
      if (stars.some((s) => Math.hypot(s.p[0] - p[0], s.p[1] - p[1]) < minSep)) continue;
      stars.push({ p, r });
    }
    if (stars.length >= n) break;
  }
  if (stars.length === 0) return { requested: n, stars, threads: [], chestLink: null };

  // Minimum spanning tree (Prim)
  const threads: Array<[Pt, Pt]> = [];
  const inTree = new Set<number>([0]);
  while (inTree.size < stars.length) {
    let best: [number, number, number] | null = null;
    for (const i of inTree) {
      for (let j = 0; j < stars.length; j++) {
        if (inTree.has(j)) continue;
        const d = Math.hypot(stars[i]!.p[0] - stars[j]!.p[0], stars[i]!.p[1] - stars[j]!.p[1]);
        if (!best || d < best[2]) best = [i, j, d];
      }
    }
    if (!best) break;
    inTree.add(best[1]);
    threads.push([stars[best[0]]!.p, stars[best[1]]!.p]);
  }

  const nearest = stars.reduce((a, b) =>
    Math.hypot(a.p[0] - chest[0], a.p[1] - chest[1]) <=
    Math.hypot(b.p[0] - chest[0], b.p[1] - chest[1])
      ? a
      : b,
  );
  return { requested: n, stars, threads, chestLink: [nearest.p, chest] };
}
