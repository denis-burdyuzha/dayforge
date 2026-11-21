/**
 * foxZones — доступ к полигонам Fox-ассетов (L1..L5) по тиру и зоне + базовая геометрия.
 *
 * Зоны берутся ИЗ данных (`zone` в FoxL{N}AssetData.ts ← <g id="..."> в foxL{N}.svg).
 * Эффекты атрибутов живут в ../../attributeFx и получают лису через foxAnatomy.ts.
 */

import type { FoxZonePoly } from "../../assets/foxAssetTypes";
import { FOX_L1_POLYGONS } from "../../assets/FoxL1AssetData";
import { FOX_L2_POLYGONS } from "../../assets/FoxL2AssetData";
import { FOX_L3_POLYGONS } from "../../assets/FoxL3AssetData";
import { FOX_L4_POLYGONS } from "../../assets/FoxL4AssetData";
import { FOX_L5_POLYGONS } from "../../assets/FoxL5AssetData";
export type { FoxZonePoly };

export type FoxTierIndex = 1 | 2 | 3 | 4 | 5;

const TIER_POLYS: Record<FoxTierIndex, ReadonlyArray<FoxZonePoly>> = {
  1: FOX_L1_POLYGONS,
  2: FOX_L2_POLYGONS,
  3: FOX_L3_POLYGONS,
  4: FOX_L4_POLYGONS,
  5: FOX_L5_POLYGONS,
};

export function getTierPolys(tier: FoxTierIndex): ReadonlyArray<FoxZonePoly> {
  return TIER_POLYS[tier];
}

export function getZonePolys(tier: FoxTierIndex, zone: string): FoxZonePoly[] {
  if (zone === "unassigned") return [];
  return TIER_POLYS[tier].filter((p) => p.zone === zone);
}

export function hasZone(tier: FoxTierIndex, zone: string): boolean {
  return getZonePolys(tier, zone).length > 0;
}

// ── geometry ────────────────────────────────────────────────────────────────

export type Pt = [number, number];

export function parsePts(points: string): Pt[] {
  const out: Pt[] = [];
  for (const tok of points.trim().split(/\s+/)) {
    const [xs, ys] = tok.split(",");
    const x = parseFloat(xs ?? "");
    const y = parseFloat(ys ?? "");
    if (!isNaN(x) && !isNaN(y)) out.push([x, y]);
  }
  return out;
}

export function polyArea(pts: Pt[]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    if (p && q) a += p[0] * q[1] - q[0] * p[1];
  }
  return Math.abs(a) / 2;
}

export function polyCentroid(pts: Pt[]): Pt {
  let sx = 0,
    sy = 0;
  for (const p of pts) {
    sx += p[0];
    sy += p[1];
  }
  const n = pts.length || 1;
  return [sx / n, sy / n];
}

export function pointInPoly(x: number, y: number, pts: Pt[]): boolean {
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

export function polysBBox(polys: ReadonlyArray<{ points: string }>): BBox | null {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const poly of polys) {
    for (const [x, y] of parsePts(poly.points)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (!isFinite(minX)) return null;
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
