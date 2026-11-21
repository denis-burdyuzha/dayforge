/**
 * Intelligence — neural network on the forehead (pure geometry, asset space).
 * The fxStep(v, 10) forehead polygons closest to foreheadCenter (continued by the nearest head
 * polygons when the forehead is too small), each subdivided once (centroid → vertices).
 * Nodes sit at the centroids and at vertices shared by selected facets. Each node gets a wave delay
 * proportional to its distance from foreheadCenter (one wave every 4 s, see IntelligenceFx).
 */

import { dist, type Pt } from "./anatomy";
import type { FxContext } from "./fxContext";
import { fxStep } from "./fxSeed";

/** Time the wave needs to travel from foreheadCenter to the farthest node, seconds */
export const INTELLIGENCE_WAVE_SPREAD_S = 1.2;
/** Wave period, seconds */
export const INTELLIGENCE_WAVE_PERIOD_S = 4;

export interface NeuralNetwork {
  facets: string[];
  lines: Array<[Pt, Pt]>;
  nodes: Array<{ p: Pt; delay: number }>;
}

export function computeIntelligenceNetwork(ctx: FxContext): NeuralNetwork | null {
  const n = fxStep(ctx.values.intelligence, 10);
  if (n === 0) return null;
  const { geo } = ctx;
  const fc = geo.foreheadCenter;
  const c = (id: string): Pt => geo.centroids.get(id) ?? fc;
  const byDist = (a: string, b: string) => dist(c(a), fc) - dist(c(b), fc) || a.localeCompare(b);
  const foreheadSet = new Set(geo.forehead);
  const ordered = [
    ...[...geo.forehead].sort(byDist),
    ...geo.headPolys.filter((id) => !foreheadSet.has(id)).sort(byDist),
  ];
  const facets = ordered.slice(0, n);
  if (facets.length === 0) return null;

  const lines: Array<[Pt, Pt]> = [];
  const vertexUse = new Map<string, { p: Pt; count: number }>();
  for (const id of facets) {
    const poly = geo.polyById.get(id);
    if (!poly) continue;
    const cen = c(id);
    const seen = new Set<string>();
    for (const v of poly.points) {
      lines.push([cen, v]);
      const k = `${Math.round(v[0] * 2)},${Math.round(v[1] * 2)}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const e = vertexUse.get(k);
      if (e) e.count++;
      else vertexUse.set(k, { p: v, count: 1 });
    }
  }
  const nodePts: Pt[] = [
    ...facets.map(c),
    ...[...vertexUse.values()].filter((v) => v.count >= 2).map((v) => v.p),
  ];
  const maxD = Math.max(1e-6, ...nodePts.map((p) => dist(p, fc)));
  return {
    facets,
    lines,
    nodes: nodePts.map((p) => ({ p, delay: (dist(p, fc) / maxD) * INTELLIGENCE_WAVE_SPREAD_S })),
  };
}
