/**
 * foxZones — доступ к полигонам Fox-ассетов (L1..L5) по тиру и зоне + базовая геометрия.
 *
 * Зоны берутся ИЗ данных (`zone` в FoxL{N}AssetData.ts ← <g id="..."> в foxL{N}.svg).
 * Эффекты атрибутов живут в ../../attributeFx и получают лису через foxAnatomy.ts.
 */

import type { FoxZonePoly } from "../../assets/foxAssetTypes";
import { loadTier, peekTier } from "../../shared/tierAssetStore";
import { computeFoxAspectAccentIds } from "./foxAspectAccent";
export type { FoxZonePoly };

export type FoxTierIndex = 1 | 2 | 3 | 4 | 5;

/** The data of one fox tier — a lazy chunk (the five FoxL{N}AssetData files are NOT in the main bundle) */
export interface FoxTierData {
  polygons: ReadonlyArray<FoxZonePoly>;
  /** eyes + warm tail tips (shared aspect accent) */
  aspectAccentIds: readonly string[];
}

const toData = (polygons: ReadonlyArray<FoxZonePoly>): FoxTierData => ({
  polygons,
  aspectAccentIds: computeFoxAspectAccentIds(polygons),
});

/** Dynamic importers, one chunk per tier */
export const FOX_TIER_LOADERS: Record<FoxTierIndex, () => Promise<FoxTierData>> = {
  1: () => import("../../assets/FoxL1AssetData").then((m) => toData(m.FOX_L1_POLYGONS)),
  2: () => import("../../assets/FoxL2AssetData").then((m) => toData(m.FOX_L2_POLYGONS)),
  3: () => import("../../assets/FoxL3AssetData").then((m) => toData(m.FOX_L3_POLYGONS)),
  4: () => import("../../assets/FoxL4AssetData").then((m) => toData(m.FOX_L4_POLYGONS)),
  5: () => import("../../assets/FoxL5AssetData").then((m) => toData(m.FOX_L5_POLYGONS)),
};

export const foxTierKey = (tier: FoxTierIndex) => `fox:L${tier}`;

export function loadFoxTier(tier: FoxTierIndex): Promise<FoxTierData> {
  return loadTier(foxTierKey(tier), FOX_TIER_LOADERS[tier]);
}

/** Load all five tiers (tests, the playground) */
export function preloadAllFoxTiers(): Promise<FoxTierData[]> {
  return Promise.all(([1, 2, 3, 4, 5] as const).map(loadFoxTier));
}

/** The polygons of a LOADED tier (throws if it has not been loaded yet) */
export function getTierPolys(tier: FoxTierIndex): ReadonlyArray<FoxZonePoly> {
  const data = peekTier<FoxTierData>(foxTierKey(tier));
  if (!data) throw new Error(`fox tier ${tier} is not loaded`);
  return data.polygons;
}

export function getZonePolys(tier: FoxTierIndex, zone: string): FoxZonePoly[] {
  if (zone === "unassigned") return [];
  return getTierPolys(tier).filter((p) => p.zone === zone);
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
