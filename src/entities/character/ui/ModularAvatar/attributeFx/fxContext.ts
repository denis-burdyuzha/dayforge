/**
 * FxContext — everything an attribute effect needs: anatomy + derived geometry, palette,
 * raw attribute values, per-character seed key, asset→canvas transform and the silhouette
 * probes used to place crystals (Discipline) and keep stars clear of them (Social).
 */

import type { AttributeKey } from "../../../model/types";
import {
  type AnatomyGeometry,
  bboxOf,
  type CreatureAnatomy,
  distToSegment,
  getAnatomyGeometry,
  pointInPoly,
  type Pt,
} from "./anatomy";
import { type FxPalette, getFxPalette } from "./fxPalette";

/** Avatar canvas (viewBox of every creature SVG) */
export const FX_CANVAS = { w: 200, h: 240 } as const;

export type AttributeValues = Record<AttributeKey, number>;

export interface AssetTransform {
  tx: number;
  ty: number;
  scale: number;
}

/**
 * Outer space split (canvas): the top 35% belongs to Social only; the rest of the space around the
 * silhouette (sides and bottom) belongs to Discipline only.
 */
export const FX_TOP_BAND = 0.35;

export interface SilhouetteProbe {
  /** crystal size in canvas px */
  crystalSize: number;
  /** distance (canvas px) from a point to the silhouette; 0 when inside */
  distanceTo: (p: Pt) => number;
  isInside: (p: Pt) => boolean;
}

export interface FxContext {
  anatomy: CreatureAnatomy;
  geo: AnatomyGeometry;
  palette: FxPalette;
  values: AttributeValues;
  seedKey: string;
  transform: AssetTransform;
  /** asset units per 1 canvas px */
  unit: number;
  toCanvas: (p: Pt) => Pt;
  silhouette: SilhouetteProbe;
}

interface CanvasPoly {
  pts: Pt[];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function buildSilhouette(
  geo: AnatomyGeometry,
  anatomy: CreatureAnatomy,
  t: AssetTransform,
): SilhouetteProbe {
  const toCanvas = (p: Pt): Pt => [t.tx + p[0] * t.scale, t.ty + p[1] * t.scale];
  const polys: CanvasPoly[] = anatomy.polygons.map((p) => {
    const pts = p.points.map(toCanvas);
    const bb = bboxOf(pts);
    return { pts, minX: bb.minX, minY: bb.minY, maxX: bb.maxX, maxY: bb.maxY };
  });
  const outer = geo.outerEdges.map((e) => [toCanvas(e.a), toCanvas(e.b)] as const);
  const isInside = (p: Pt): boolean =>
    polys.some(
      (q) =>
        p[0] >= q.minX &&
        p[0] <= q.maxX &&
        p[1] >= q.minY &&
        p[1] <= q.maxY &&
        pointInPoly(p[0], p[1], q.pts),
    );
  const distanceTo = (p: Pt): number => {
    if (isInside(p)) return 0;
    let m = Infinity;
    for (const [a, b] of outer) m = Math.min(m, distToSegment(p, a, b));
    return m;
  };
  const sb = geo.silhouetteBBox;
  const halfDiag = (Math.hypot(sb.w, sb.h) / 2) * t.scale;
  const crystalSize = Math.max(6, Math.min(12, halfDiag * 0.13));
  return { crystalSize, distanceTo, isInside };
}

const silhouetteCache = new WeakMap<CreatureAnatomy, Map<string, SilhouetteProbe>>();

/** Canvas-space silhouette probe — cached per anatomy + transform */
function getSilhouette(
  geo: AnatomyGeometry,
  anatomy: CreatureAnatomy,
  t: AssetTransform,
): SilhouetteProbe {
  let byTransform = silhouetteCache.get(anatomy);
  if (!byTransform) {
    byTransform = new Map();
    silhouetteCache.set(anatomy, byTransform);
  }
  const key = `${t.tx}|${t.ty}|${t.scale}`;
  let probe = byTransform.get(key);
  if (!probe) {
    probe = buildSilhouette(geo, anatomy, t);
    byTransform.set(key, probe);
  }
  return probe;
}

export function createFxContext(input: {
  anatomy: CreatureAnatomy;
  classId: string;
  values: AttributeValues;
  seedKey: string;
  transform: AssetTransform;
}): FxContext {
  const { anatomy, transform } = input;
  const geo = getAnatomyGeometry(anatomy);
  return {
    anatomy,
    geo,
    palette: getFxPalette(input.classId),
    values: input.values,
    seedKey: input.seedKey,
    transform,
    unit: 1 / transform.scale,
    toCanvas: (p) => [transform.tx + p[0] * transform.scale, transform.ty + p[1] * transform.scale],
    silhouette: getSilhouette(geo, anatomy, transform),
  };
}
