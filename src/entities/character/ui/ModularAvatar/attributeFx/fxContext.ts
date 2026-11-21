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

export interface CrystalOrbit {
  /** canvas coords */
  center: Pt;
  /** crystal size in canvas px */
  crystalSize: number;
  /** minimal clearance between a crystal centre and the silhouette, canvas px */
  minGap: number;
  /** furthest silhouette point along a ray from the centre (canvas px) */
  silhouetteDistance: (angleRad: number) => number;
  isInsideSilhouette: (p: Pt) => boolean;
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
  orbit: CrystalOrbit;
}

interface CanvasPoly {
  pts: Pt[];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function buildOrbit(
  geo: AnatomyGeometry,
  anatomy: CreatureAnatomy,
  t: AssetTransform,
): CrystalOrbit {
  const toCanvas = (p: Pt): Pt => [t.tx + p[0] * t.scale, t.ty + p[1] * t.scale];
  const polys: CanvasPoly[] = anatomy.polygons.map((p) => {
    const pts = p.points.map(toCanvas);
    const bb = bboxOf(pts);
    return { pts, minX: bb.minX, minY: bb.minY, maxX: bb.maxX, maxY: bb.maxY };
  });
  const isInsideSilhouette = (p: Pt): boolean =>
    polys.some(
      (q) =>
        p[0] >= q.minX &&
        p[0] <= q.maxX &&
        p[1] >= q.minY &&
        p[1] <= q.maxY &&
        pointInPoly(p[0], p[1], q.pts),
    );
  const sb = geo.silhouetteBBox;
  const center = toCanvas([sb.cx, sb.cy]);
  const halfDiag = (Math.hypot(sb.w, sb.h) / 2) * t.scale;
  const maxR = halfDiag + 10;
  const silhouetteDistance = (angle: number): number => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    let inside = 0;
    for (let r = 0; r <= maxR; r += 2) {
      if (isInsideSilhouette([center[0] + r * c, center[1] + r * s])) inside = r;
    }
    return inside;
  };
  const crystalSize = Math.max(6, Math.min(12, halfDiag * 0.13));
  const minGap = crystalSize * 1.5 + 10;
  return {
    center,
    crystalSize,
    minGap,
    silhouetteDistance,
    isInsideSilhouette,
  };
}

const orbitCache = new WeakMap<CreatureAnatomy, Map<string, CrystalOrbit>>();

/** Orbit is expensive (ray-marching) — cached per anatomy + transform */
function getOrbit(geo: AnatomyGeometry, anatomy: CreatureAnatomy, t: AssetTransform): CrystalOrbit {
  let byTransform = orbitCache.get(anatomy);
  if (!byTransform) {
    byTransform = new Map();
    orbitCache.set(anatomy, byTransform);
  }
  const key = `${t.tx}|${t.ty}|${t.scale}`;
  let orbit = byTransform.get(key);
  if (!orbit) {
    orbit = buildOrbit(geo, anatomy, t);
    byTransform.set(key, orbit);
  }
  return orbit;
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
    orbit: getOrbit(geo, anatomy, transform),
  };
}
