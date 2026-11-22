/**
 * Strength — crest along the nape (pure geometry, asset space).
 * fxStep(v, 7) spikes; each spike is a triangle based on an OUTER (silhouette) edge of a nape polygon,
 * apex pointing away from the torso centroid. Spikes are spread evenly along the nape edge chain,
 * ordered from the head towards the back; spikes closer to the head are taller (10% → 6% of torso height).
 */

import type { MeshEdge, Pt } from "./anatomy";
import { dist } from "./anatomy";
import type { FxContext } from "./fxContext";
import { fxStep } from "./fxSeed";

export interface StrengthSpike {
  base1: Pt;
  base2: Pt;
  tip: Pt;
}

interface OrientedEdge extends MeshEdge {
  len: number;
  normal: Pt;
  mid: Pt;
}

function orient(e: MeshEdge, from: Pt): OrientedEdge | null {
  const dx = e.b[0] - e.a[0];
  const dy = e.b[1] - e.a[1];
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return null;
  const mid: Pt = [(e.a[0] + e.b[0]) / 2, (e.a[1] + e.b[1]) / 2];
  let normal: Pt = [-dy / len, dx / len];
  if (normal[0] * (mid[0] - from[0]) + normal[1] * (mid[1] - from[1]) < 0) {
    normal = [-normal[0], -normal[1]];
  }
  return { ...e, len, normal, mid };
}

export function computeStrengthSpikes(ctx: FxContext): StrengthSpike[] {
  const n = fxStep(ctx.values.strength, 7);
  if (n === 0) return [];
  const { geo } = ctx;
  const from = geo.torsoCenter;
  const upward = (e: OrientedEdge) => e.normal[1] < 0.35; // outward & not pointing down

  const nape = new Set(geo.nape);
  let edges = geo.outerEdges
    .filter((e) => nape.has(e.polyId))
    .map((e) => orient(e, from))
    .filter((e): e is OrientedEdge => e !== null && upward(e));

  if (edges.length === 0) {
    // Fallback: outer edges of the upper 30% of the torso
    const torso = new Set(geo.torsoPolys);
    const topY = geo.torsoBBox.minY + geo.torsoBBox.h * 0.3;
    edges = geo.outerEdges
      .filter((e) => torso.has(e.polyId))
      .map((e) => orient(e, from))
      .filter((e): e is OrientedEdge => e !== null && upward(e) && e.mid[1] <= topY);
  }
  if (edges.length === 0) {
    // Fallback: top side of the torso bbox
    const bb = geo.torsoBBox;
    const e = orient(
      { a: [bb.minX + bb.w * 0.2, bb.minY], b: [bb.maxX - bb.w * 0.2, bb.minY] },
      from,
    );
    if (e) edges = [e];
  }
  if (edges.length === 0) return [];

  // head → back
  edges.sort((p, q) => dist(p.mid, geo.headCenter) - dist(q.mid, geo.headCenter));
  const total = edges.reduce((s, e) => s + e.len, 0);
  const torsoH = Math.max(1, geo.torsoBBox.h);
  const spikes: StrengthSpike[] = [];

  for (let i = 0; i < n; i++) {
    let s = ((i + 0.5) / n) * total;
    let edge = edges[edges.length - 1]!;
    for (const e of edges) {
      if (s <= e.len) {
        edge = e;
        break;
      }
      s -= e.len;
    }
    const t = Math.max(0, Math.min(1, s / edge.len));
    const halfW = Math.min(edge.len / 2, (total / n) * 0.4);
    const t1 = Math.max(0, t - halfW / edge.len);
    const t2 = Math.min(1, t + halfW / edge.len);
    const at = (k: number): Pt => [
      edge.a[0] + (edge.b[0] - edge.a[0]) * k,
      edge.a[1] + (edge.b[1] - edge.a[1]) * k,
    ];
    const base1 = at(t1);
    const base2 = at(t2);
    const center: Pt = [(base1[0] + base2[0]) / 2, (base1[1] + base2[1]) / 2];
    const h = torsoH * (0.1 - 0.04 * (n > 1 ? i / (n - 1) : 0));
    spikes.push({
      base1,
      base2,
      tip: [center[0] + edge.normal[0] * h, center[1] + edge.normal[1] * h],
    });
  }
  return spikes;
}
