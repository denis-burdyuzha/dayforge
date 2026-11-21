/**
 * Social — constellation behind the avatar (canvas space). Nothing is drawn on the body.
 * Social owns the TOP 35% of the canvas (the space below belongs to Discipline).
 * fxStep(v, 5) stars inside that band, ≥6px from the canvas edge, ≥8px from the silhouette,
 * ≥24px apart, seeded positions. If fewer fit, only those are drawn.
 * Threads: minimum spanning tree over the stars; the star nearest to the chest point is linked to it
 * (that thread runs behind the body — the whole Social layer is under the asset).
 */

import type { Pt } from "./anatomy";
import { FX_CANVAS, FX_TOP_BAND, type FxContext } from "./fxContext";
import { fxRng, fxStep } from "./fxSeed";

export interface Constellation {
  requested: number;
  stars: Array<{ p: Pt; r: number }>;
  threads: Array<[Pt, Pt]>;
  chestLink: [Pt, Pt] | null;
}

export const SOCIAL_SILHOUETTE_MARGIN = 8;
export const SOCIAL_EDGE_MARGIN = 6;
export const SOCIAL_MIN_SEPARATION = 24;
const ATTEMPTS = 1500;

export function computeSocialConstellation(ctx: FxContext): Constellation | null {
  const n = fxStep(ctx.values.social, 5);
  if (n === 0) return null;
  const rng = fxRng(ctx.seedKey, "social");
  const chest = ctx.toCanvas(ctx.geo.chestPoint);
  const bandY = FX_CANVAS.h * FX_TOP_BAND;

  const stars: Array<{ p: Pt; r: number }> = [];
  for (let attempt = 0; attempt < ATTEMPTS && stars.length < n; attempt++) {
    const r = 1.5 + rng();
    const lo = SOCIAL_EDGE_MARGIN + r;
    const p: Pt = [lo + rng() * (FX_CANVAS.w - 2 * lo), lo + rng() * (bandY - r - lo)];
    if (ctx.silhouette.distanceTo(p) < SOCIAL_SILHOUETTE_MARGIN + r) continue;
    if (stars.some((s) => Math.hypot(s.p[0] - p[0], s.p[1] - p[1]) < SOCIAL_MIN_SEPARATION))
      continue;
    stars.push({ p, r });
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
