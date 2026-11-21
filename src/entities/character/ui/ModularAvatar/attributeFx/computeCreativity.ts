/**
 * Creativity — "Sign": a personal pattern drawn along mesh edges (pure geometry, asset space).
 * Start: a seeded torso polygon outside the nape. Growth: walk the adjacency graph from polygon to a
 * neighbour, drawing their shared edge; fxStep(v, 14) edges; seeded choice without repeating polygons,
 * preferring directions away from the head. Branches of 3 edges at v ≥ 10 and v ≥ 15.
 * Forehead (Intelligence) and nape (Strength) polygons are never used.
 */

import { edgeKey, type MeshEdge, type Pt } from "./anatomy";
import type { FxContext } from "./fxContext";
import { fxRng, fxStep } from "./fxSeed";

export interface PersonalSign {
  path: string[];
  branches: string[][];
  edges: MeshEdge[];
}

export function computeCreativitySign(ctx: FxContext): PersonalSign | null {
  const v = ctx.values.creativity;
  const n = fxStep(v, 14);
  if (n === 0) return null;
  const { geo } = ctx;
  const rng = fxRng(ctx.seedKey, "creativity");
  const blocked = new Set([...geo.forehead, ...geo.nape]);
  const allowed = (id: string) => !blocked.has(id);
  const c = (id: string): Pt => geo.centroids.get(id) ?? geo.torsoCenter;
  const head = geo.headCenter;

  const starts = geo.torsoPolys.filter(allowed);
  const startPool =
    starts.length > 0 ? starts : geo.torsoPolys.concat(geo.headPolys).filter(allowed);
  if (startPool.length === 0) return null;
  const visited = new Set<string>();

  const nextFrom = (cur: string): string | null => {
    const nbrs = (geo.adjacency.get(cur) ?? []).filter((id) => allowed(id) && !visited.has(id));
    if (nbrs.length === 0) return null;
    const cc = c(cur);
    const away: Pt = [cc[0] - head[0], cc[1] - head[1]];
    const al = Math.hypot(away[0], away[1]) || 1;
    const weights = nbrs.map((id) => {
      const nc = c(id);
      const d: Pt = [nc[0] - cc[0], nc[1] - cc[1]];
      const dl = Math.hypot(d[0], d[1]) || 1;
      const dot = (d[0] * away[0] + d[1] * away[1]) / (dl * al);
      return 1 + 3 * Math.max(0, dot);
    });
    const total = weights.reduce((s, w) => s + w, 0);
    let r = rng() * total;
    for (let i = 0; i < nbrs.length; i++) {
      r -= weights[i]!;
      if (r <= 0) return nbrs[i]!;
    }
    return nbrs[nbrs.length - 1]!;
  };

  const grow = (from: string, steps: number): string[] => {
    const chain = [from];
    visited.add(from);
    let cur = from;
    for (let i = 0; i < steps; i++) {
      const nx = nextFrom(cur);
      if (!nx) break;
      visited.add(nx);
      chain.push(nx);
      cur = nx;
    }
    return chain;
  };

  const path = grow(startPool[Math.floor(rng() * startPool.length)]!, n);
  const branches: string[][] = [];
  const branchCount = v >= 15 ? 2 : v >= 10 ? 1 : 0;
  // Try path nodes in a seeded order; keep the first full 3-edge branch (or the longest found).
  const tryBranch = (root: string): string[] => {
    const chain = [root];
    let cur = root;
    for (let i = 0; i < 3; i++) {
      const nx = nextFrom(cur);
      if (!nx) break;
      visited.add(nx);
      chain.push(nx);
      cur = nx;
    }
    return chain;
  };
  const roots = path
    .slice(1)
    .map((id) => ({ id, k: rng() }))
    .sort((x, y) => x.k - y.k);
  const usedRoots = new Set<string>();
  for (let b = 0; b < branchCount; b++) {
    let best: string[] = [];
    for (const { id } of roots) {
      if (usedRoots.has(id)) continue;
      const chain = tryBranch(id);
      if (chain.length > best.length) {
        best.slice(1).forEach((x) => visited.delete(x));
        best = chain;
      } else {
        chain.slice(1).forEach((x) => visited.delete(x));
      }
      if (best.length === 4) break;
    }
    if (best.length > 1) {
      usedRoots.add(best[0]!);
      branches.push(best);
    }
  }

  const edges: MeshEdge[] = [];
  for (const chain of [path, ...branches]) {
    for (let i = 0; i + 1 < chain.length; i++) {
      const e = geo.sharedEdges.get(edgeKey(chain[i]!, chain[i + 1]!));
      if (e) edges.push(e);
    }
  }
  return { path, branches, edges };
}
