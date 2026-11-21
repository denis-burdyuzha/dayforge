/**
 * Endurance — scars (pure geometry, asset space). fxStep(v, 4) scars, in this order:
 *   1–2: torso (outside the nape), 3: limbs (fallback torso), 4: head (outside the forehead).
 * A scar is a 3-point polyline, 12–18% of the zone width long, at 30–60° (seeded), lying inside one
 * polygon or that polygon plus one neighbour; 3–4 short cross stitches. Static.
 */

import { bboxOf, pointInPoly, polyCentroid, type Pt } from "./anatomy";
import type { FxContext } from "./fxContext";
import { fxRng, fxStep } from "./fxSeed";

export interface Scar {
  points: [Pt, Pt, Pt];
  stitches: Array<[Pt, Pt]>;
}

type Slot = "torso" | "limbs" | "head";
const SLOT_ORDER: Slot[] = ["torso", "torso", "limbs", "head"];

function pointAt(pts: Pt[], t: number): { p: Pt; dir: Pt } {
  const segs: Array<{ a: Pt; b: Pt; len: number }> = [];
  let total = 0;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segs.push({ a, b, len });
    total += len;
  }
  let s = t * total;
  for (const seg of segs) {
    if (s <= seg.len || seg === segs[segs.length - 1]) {
      const k = seg.len > 0 ? Math.min(1, s / seg.len) : 0;
      const dir: Pt =
        seg.len > 0 ? [(seg.b[0] - seg.a[0]) / seg.len, (seg.b[1] - seg.a[1]) / seg.len] : [1, 0];
      return {
        p: [seg.a[0] + (seg.b[0] - seg.a[0]) * k, seg.a[1] + (seg.b[1] - seg.a[1]) * k],
        dir,
      };
    }
    s -= seg.len;
  }
  return { p: pts[0]!, dir: [1, 0] };
}

export function computeEnduranceScars(ctx: FxContext): Scar[] {
  const n = fxStep(ctx.values.endurance, 4);
  if (n === 0) return [];
  const { geo } = ctx;
  const rng = fxRng(ctx.seedKey, "endurance");
  const nape = new Set(geo.nape);
  const forehead = new Set(geo.forehead);
  const nonEmpty = (a: string[], b: string[]) => (a.length > 0 ? a : b);
  const zoneIds: Record<Slot, string[]> = {
    torso: nonEmpty(
      geo.torsoPolys.filter((id) => !nape.has(id)),
      geo.torsoPolys,
    ),
    limbs: [],
    head: nonEmpty(
      geo.headPolys.filter((id) => !forehead.has(id)),
      geo.headPolys,
    ),
  };
  zoneIds.limbs = nonEmpty(geo.limbPolys, zoneIds.torso);

  const used = new Set<string>();
  const scars: Scar[] = [];

  for (const slot of SLOT_ORDER.slice(0, n)) {
    const ids = zoneIds[slot];
    if (ids.length === 0) continue;
    const zoneW = Math.max(1, bboxOf(ids.flatMap((id) => geo.polyById.get(id)?.points ?? [])).w);
    const byArea = ids
      .filter((id) => !used.has(id))
      .sort((a, b) => (geo.areas.get(b) ?? 0) - (geo.areas.get(a) ?? 0));
    const cands = byArea.slice(0, Math.max(1, Math.ceil(byArea.length * 0.5)));
    if (cands.length === 0) continue;

    let placed: { scar: Scar; host: string } | null = null;
    // full 12–18% length first; shrink only as a last resort
    for (const shrink of [1, 0.75, 0.55]) {
      for (let attempt = 0; attempt < 16 && !placed; attempt++) {
        const host = cands[Math.floor(rng() * cands.length)]!;
        const hostPoly = geo.polyById.get(host);
        if (!hostPoly) continue;
        const region = [host, ...(geo.adjacency.get(host) ?? [])];
        const angle = (((30 + 30 * rng()) * Math.PI) / 180) * (rng() < 0.5 ? -1 : 1);
        const len = zoneW * (0.12 + 0.06 * rng()) * shrink;
        const bend = (rng() - 0.5) * 0.25 * len;
        const c = polyCentroid(hostPoly.points);
        const d: Pt = [Math.cos(angle), Math.sin(angle)];
        const perp: Pt = [-d[1], d[0]];
        const pts: [Pt, Pt, Pt] = [
          [c[0] - (d[0] * len) / 2, c[1] - (d[1] * len) / 2],
          [c[0] + perp[0] * bend, c[1] + perp[1] * bend],
          [c[0] + (d[0] * len) / 2, c[1] + (d[1] * len) / 2],
        ];
        const touched = new Set<string>();
        let ok = true;
        for (let k = 0; k <= 10 && ok; k++) {
          const { p } = pointAt(pts, k / 10);
          const inside = region.find((id) => {
            const poly = geo.polyById.get(id);
            return poly ? pointInPoly(p[0], p[1], poly.points) : false;
          });
          if (!inside) ok = false;
          else touched.add(inside);
        }
        if (!ok || touched.size > 2) continue;

        const stitchCount = rng() < 0.5 ? 3 : 4;
        const stitchLen = Math.min(3 * ctx.unit, len * 0.3);
        const stitches: Array<[Pt, Pt]> = [];
        for (let k = 0; k < stitchCount; k++) {
          const { p, dir } = pointAt(pts, (k + 1) / (stitchCount + 1));
          const nx = -dir[1] * (stitchLen / 2);
          const ny = dir[0] * (stitchLen / 2);
          stitches.push([
            [p[0] - nx, p[1] - ny],
            [p[0] + nx, p[1] + ny],
          ]);
        }
        placed = { scar: { points: pts, stitches }, host };
      }
      if (placed) break;
    }
    if (placed) {
      used.add(placed.host);
      scars.push(placed.scar);
    }
  }
  return scars;
}
