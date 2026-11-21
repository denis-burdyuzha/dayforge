/**
 * Creature anatomy adapter for the universal attribute FX system.
 *
 * A creature (any class) provides its polygons + which zone names form head/torso/eyes/limbs/tail.
 * Every derived anchor (forehead, nape, chest point, eye points, hull, adjacency) is computed here
 * geometrically — nothing is hand-placed. Effects only consume this module, never creature files.
 * All coordinates are in the creature asset space.
 */

export type Pt = [number, number];

export type CreatureAnatomy = {
  polygons: { id: string; zone: string; points: [number, number][] }[];
  zones: {
    head: string[]; // required
    torso: string[]; // required
    eyes?: string[];
    limbs?: string[];
    tail?: string[];
  };
  viewBox: { w: number; h: number };
};

export type AnatomyPolygon = CreatureAnatomy["polygons"][number];

export interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

export interface MeshEdge {
  a: Pt;
  b: Pt;
}

export interface AnatomyGeometry {
  polyById: Map<string, AnatomyPolygon>;
  centroids: Map<string, Pt>;
  areas: Map<string, number>;
  headPolys: string[];
  torsoPolys: string[];
  eyePolys: string[];
  limbPolys: string[];
  tailPolys: string[];
  headBBox: BBox;
  torsoBBox: BBox;
  headCenter: Pt;
  torsoCenter: Pt;
  /** head polygons with centroid in the top 45% of head bbox and central 50% of its width */
  forehead: string[];
  foreheadCenter: Pt;
  /** torso polygons in the top 30% of torso bbox, the 40% closest to the head */
  nape: string[];
  /** centroid of the torso polygons closest to the head */
  chestPoint: Pt;
  eyePoints: Pt[];
  silhouetteBBox: BBox;
  silhouetteHull: Pt[];
  /** neighbours by shared edge (2 coincident vertices, tolerance 0.5) */
  adjacency: Map<string, string[]>;
  /** shared edge for each neighbour pair, key = edgeKey(a, b) */
  sharedEdges: Map<string, MeshEdge>;
  /** polygon edges that belong to exactly one polygon (silhouette / hole boundary) */
  outerEdges: Array<MeshEdge & { polyId: string }>;
}

// ── geometry helpers ─────────────────────────────────────────────────────────

export function polyArea(pts: ReadonlyArray<Pt>): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    if (p && q) a += p[0] * q[1] - q[0] * p[1];
  }
  return Math.abs(a) / 2;
}

export function polyCentroid(pts: ReadonlyArray<Pt>): Pt {
  let sx = 0;
  let sy = 0;
  for (const p of pts) {
    sx += p[0];
    sy += p[1];
  }
  const n = pts.length || 1;
  return [sx / n, sy / n];
}

export function meanPoint(pts: ReadonlyArray<Pt>, fallback: Pt): Pt {
  return pts.length > 0 ? polyCentroid(pts) : fallback;
}

export function pointInPoly(x: number, y: number, pts: ReadonlyArray<Pt>): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (!a || !b) continue;
    if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) {
      inside = !inside;
    }
  }
  return inside;
}

export function bboxOf(pts: ReadonlyArray<Pt>): BBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  if (!Number.isFinite(minX)) {
    minX = 0;
    minY = 0;
    maxX = 0;
    maxY = 0;
  }
  return {
    minX,
    minY,
    maxX,
    maxY,
    w: maxX - minX,
    h: maxY - minY,
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
  };
}

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return dist(p, a);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/** Distance from a point to a closed polygon outline */
export function distToOutline(p: Pt, outline: ReadonlyArray<Pt>): number {
  let m = Infinity;
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i];
    const b = outline[(i + 1) % outline.length];
    if (a && b) m = Math.min(m, distToSegment(p, a, b));
  }
  return m;
}

/** Convex hull (monotone chain), counter-clockwise */
export function convexHull(points: ReadonlyArray<Pt>): Pt[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;
  const cross = (o: Pt, a: Pt, b: Pt) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Pt[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: Pt[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]!;
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/** Vertex key with 0.5 tolerance grid */
function vKey(p: Pt): string {
  return `${Math.round(p[0] * 2)},${Math.round(p[1] * 2)}`;
}

/** Stable key of a polygon pair */
export function edgeKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

// ── builders ─────────────────────────────────────────────────────────────────

export interface BuildAnatomyInput {
  polygons: ReadonlyArray<{ id: string; zone: string; points: string | [number, number][] }>;
  zones: CreatureAnatomy["zones"];
  viewBox: { w: number; h: number };
}

/** Parse "x,y x,y ..." */
export function parsePoints(points: string): Pt[] {
  const out: Pt[] = [];
  for (const tok of points.trim().split(/\s+/)) {
    const [xs, ys] = tok.split(",");
    const x = parseFloat(xs ?? "");
    const y = parseFloat(ys ?? "");
    if (!Number.isNaN(x) && !Number.isNaN(y)) out.push([x, y]);
  }
  return out;
}

/**
 * Generic anatomy builder. Zones that a creature does not have are simply omitted / empty —
 * effects fall back gracefully. Polygons of unlisted zones (ears, snout…) still count for the
 * silhouette, hull and adjacency.
 */
export function buildAnatomy(input: BuildAnatomyInput): CreatureAnatomy {
  const present = new Set(input.polygons.map((p) => p.zone));
  const keep = (list: string[] | undefined) => (list ?? []).filter((z) => present.has(z));
  return {
    polygons: input.polygons
      .filter((p) => p.zone !== "unassigned")
      .map((p) => ({
        id: p.id,
        zone: p.zone,
        points: typeof p.points === "string" ? parsePoints(p.points) : p.points,
      })),
    zones: {
      head: keep(input.zones.head),
      torso: keep(input.zones.torso),
      eyes: keep(input.zones.eyes),
      limbs: keep(input.zones.limbs),
      tail: keep(input.zones.tail),
    },
    viewBox: input.viewBox,
  };
}

const geometryCache = new WeakMap<CreatureAnatomy, AnatomyGeometry>();

/** Derived anchors + adjacency (cached per anatomy object) */
export function getAnatomyGeometry(anatomy: CreatureAnatomy): AnatomyGeometry {
  const cached = geometryCache.get(anatomy);
  if (cached) return cached;
  const geo = deriveGeometry(anatomy);
  geometryCache.set(anatomy, geo);
  return geo;
}

function idsOfZones(anatomy: CreatureAnatomy, zones: string[] | undefined): string[] {
  const set = new Set(zones ?? []);
  return anatomy.polygons.filter((p) => set.has(p.zone)).map((p) => p.id);
}

export function deriveGeometry(anatomy: CreatureAnatomy): AnatomyGeometry {
  const polyById = new Map<string, AnatomyPolygon>();
  const centroids = new Map<string, Pt>();
  const areas = new Map<string, number>();
  const allPts: Pt[] = [];
  for (const p of anatomy.polygons) {
    polyById.set(p.id, p);
    centroids.set(p.id, polyCentroid(p.points));
    areas.set(p.id, polyArea(p.points));
    allPts.push(...p.points);
  }
  const ptsOf = (ids: string[]) => ids.flatMap((id) => polyById.get(id)?.points ?? []);
  const cOf = (id: string): Pt => centroids.get(id) ?? [0, 0];

  const silhouetteBBox = bboxOf(allPts);
  const silhouetteHull = convexHull(allPts);

  let headPolys = idsOfZones(anatomy, anatomy.zones.head);
  let torsoPolys = idsOfZones(anatomy, anatomy.zones.torso);
  // Never crash on a creature without head/torso: fall back to the upper / middle of the silhouette.
  if (torsoPolys.length === 0) {
    torsoPolys = anatomy.polygons
      .filter((p) => cOf(p.id)[1] > silhouetteBBox.minY + silhouetteBBox.h * 0.35)
      .map((p) => p.id);
  }
  if (headPolys.length === 0) {
    headPolys = anatomy.polygons
      .filter((p) => cOf(p.id)[1] <= silhouetteBBox.minY + silhouetteBBox.h * 0.35)
      .map((p) => p.id);
  }
  const eyePolys = idsOfZones(anatomy, anatomy.zones.eyes);
  const limbPolys = idsOfZones(anatomy, anatomy.zones.limbs);
  const tailPolys = idsOfZones(anatomy, anatomy.zones.tail);

  const headBBox = bboxOf(ptsOf(headPolys));
  const torsoBBox = bboxOf(ptsOf(torsoPolys));
  const headCenter: Pt = meanPoint(headPolys.map(cOf), [headBBox.cx, headBBox.cy]);
  const torsoCenter: Pt = meanPoint(torsoPolys.map(cOf), [torsoBBox.cx, torsoBBox.cy]);

  // forehead: top 45% of head bbox, central 50% of its width
  const forehead = headPolys.filter((id) => {
    const [x, y] = cOf(id);
    return y <= headBBox.minY + headBBox.h * 0.45 && Math.abs(x - headBBox.cx) <= headBBox.w * 0.25;
  });
  const foreheadCenter: Pt = meanPoint(forehead.map(cOf), [
    headBBox.cx,
    headBBox.minY + headBBox.h * 0.3,
  ]);

  // nape: top 30% of torso bbox, the 40% closest to the head centroid
  const napeCandidates = torsoPolys
    .filter((id) => cOf(id)[1] <= torsoBBox.minY + torsoBBox.h * 0.3)
    .sort((a, b) => dist(cOf(a), headCenter) - dist(cOf(b), headCenter));
  const nape = napeCandidates.slice(0, Math.max(1, Math.ceil(napeCandidates.length * 0.4)));

  // chest point: centroid of torso polygons closest to the head
  const torsoByHead = [...torsoPolys].sort(
    (a, b) => dist(cOf(a), headCenter) - dist(cOf(b), headCenter),
  );
  const chestSet = torsoByHead.slice(0, Math.max(1, Math.ceil(torsoByHead.length * 0.15)));
  const chestPoint: Pt = meanPoint(chestSet.map(cOf), torsoCenter);

  // adjacency by shared vertices
  const vertexIndex = new Map<string, string[]>();
  const vertexPos = new Map<string, Pt>();
  for (const p of anatomy.polygons) {
    const seen = new Set<string>();
    for (const pt of p.points) {
      const k = vKey(pt);
      if (seen.has(k)) continue;
      seen.add(k);
      vertexPos.set(k, pt);
      const list = vertexIndex.get(k);
      if (list) list.push(p.id);
      else vertexIndex.set(k, [p.id]);
    }
  }
  const pairShared = new Map<string, string[]>();
  for (const [k, ids] of vertexIndex) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = edgeKey(ids[i]!, ids[j]!);
        const list = pairShared.get(key);
        if (list) list.push(k);
        else pairShared.set(key, [k]);
      }
    }
  }
  const adjacency = new Map<string, string[]>();
  const sharedEdges = new Map<string, MeshEdge>();
  for (const p of anatomy.polygons) adjacency.set(p.id, []);
  for (const [key, verts] of pairShared) {
    if (verts.length < 2) continue;
    const [a, b] = key.split("|") as [string, string];
    adjacency.get(a)?.push(b);
    adjacency.get(b)?.push(a);
    sharedEdges.set(key, { a: vertexPos.get(verts[0]!)!, b: vertexPos.get(verts[1]!)! });
  }

  // outer edges: polygon edges used by exactly one polygon
  const edgeUse = new Map<string, { count: number; polyId: string; a: Pt; b: Pt }>();
  for (const p of anatomy.polygons) {
    for (let i = 0; i < p.points.length; i++) {
      const a = p.points[i]!;
      const b = p.points[(i + 1) % p.points.length]!;
      const ka = vKey(a);
      const kb = vKey(b);
      if (ka === kb) continue;
      const k = ka < kb ? `${ka}/${kb}` : `${kb}/${ka}`;
      const e = edgeUse.get(k);
      if (e) e.count++;
      else edgeUse.set(k, { count: 1, polyId: p.id, a, b });
    }
  }
  const outerEdges = [...edgeUse.values()]
    .filter((e) => e.count === 1)
    .map((e) => ({ polyId: e.polyId, a: e.a, b: e.b }));

  // eye points: connected eye groups (merged when close), up to the 2 largest
  let eyePoints: Pt[] = [];
  if (eyePolys.length > 0) {
    const eyeSet = new Set(eyePolys);
    const seen = new Set<string>();
    const groups: Array<{ ids: string[]; area: number; c: Pt }> = [];
    for (const id of eyePolys) {
      if (seen.has(id)) continue;
      const stack = [id];
      const ids: string[] = [];
      seen.add(id);
      while (stack.length) {
        const cur = stack.pop()!;
        ids.push(cur);
        for (const n of adjacency.get(cur) ?? []) {
          if (eyeSet.has(n) && !seen.has(n)) {
            seen.add(n);
            stack.push(n);
          }
        }
      }
      const area = ids.reduce((s, i) => s + (areas.get(i) ?? 0), 0);
      groups.push({ ids, area, c: weightedCentroid(ids, centroids, areas) });
    }
    const mergeDist = Math.max(1, headBBox.w * 0.12);
    const merged: typeof groups = [];
    for (const g of groups.sort((a, b) => b.area - a.area)) {
      const near = merged.find((m) => dist(m.c, g.c) < mergeDist);
      if (near) {
        const ids = [...near.ids, ...g.ids];
        near.ids = ids;
        near.area += g.area;
        near.c = weightedCentroid(ids, centroids, areas);
      } else {
        merged.push({ ...g });
      }
    }
    eyePoints = merged
      .sort((a, b) => b.area - a.area)
      .slice(0, 2)
      .map((g) => g.c);
  }
  if (eyePoints.length === 0) {
    const y = headBBox.minY + headBBox.h * 0.4;
    eyePoints = [
      [headBBox.cx - headBBox.w * 0.2, y],
      [headBBox.cx + headBBox.w * 0.2, y],
    ];
  }

  return {
    polyById,
    centroids,
    areas,
    headPolys,
    torsoPolys,
    eyePolys,
    limbPolys,
    tailPolys,
    headBBox,
    torsoBBox,
    headCenter,
    torsoCenter,
    forehead,
    foreheadCenter,
    nape,
    chestPoint,
    eyePoints,
    silhouetteBBox,
    silhouetteHull,
    adjacency,
    sharedEdges,
    outerEdges,
  };
}

function weightedCentroid(
  ids: string[],
  centroids: Map<string, Pt>,
  areas: Map<string, number>,
): Pt {
  let sx = 0;
  let sy = 0;
  let sw = 0;
  for (const id of ids) {
    const c = centroids.get(id);
    if (!c) continue;
    const w = Math.max(1e-6, areas.get(id) ?? 0);
    sx += c[0] * w;
    sy += c[1] * w;
    sw += w;
  }
  return sw > 0 ? [sx / sw, sy / sw] : [0, 0];
}
