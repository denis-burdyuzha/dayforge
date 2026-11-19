/**
 * foxZones — единственный источник правды о зонах Fox-ассетов (L1..L5).
 *
 * Зоны берутся ИЗ данных (`zone` в FoxL{N}AssetData.ts ← <g id="..."> в foxL{N}.svg).
 * Если зоны нет в данном тире (например `collar` — нет нигде), getZonePolys вернёт [] и
 * эффект просто не рисуется. Группа `unassigned` намеренно не используется эффектами.
 *
 * Все геометрические якоря (bbox, верх torso и т.д.) вычисляются программно из полигонов зоны.
 */

import { FOX_L1_POLYGONS } from "../../assets/FoxL1AssetData";
import { FOX_L2_POLYGONS } from "../../assets/FoxL2AssetData";
import { FOX_L3_POLYGONS } from "../../assets/FoxL3AssetData";
import { FOX_L4_POLYGONS } from "../../assets/FoxL4AssetData";
import { FOX_L5_POLYGONS } from "../../assets/FoxL5AssetData";
import type { FoxZonePoly } from "../../assets/foxAssetTypes";
export type { FoxZonePoly };
import type { AvatarParams } from "../../../../model/avatarTypes";

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

export interface SpikeAnchor {
  x: number;
  y: number;
  ux: number;
  uy: number;
  color: string;
  maxLen: number;
}

import { FOX_ZONES_BY_TIER, FOX_LIMB_ZONES_BY_TIER } from "./foxZoneRegistry";
export { FOX_ZONES_BY_TIER, FOX_LIMB_ZONES_BY_TIER };
export const LIMB_ZONES_BY_TIER = FOX_LIMB_ZONES_BY_TIER;

/**
 * Anchors for Strength spikes: anchored to REAL boundary vertices of the torso zone.
 * Uses the default fill color of the host facet so spikes read as organic body outgrowths.
 * Spike length is constrained to a small fraction of the torso bbox diagonal (5..8%).
 */
export function torsoTopAnchors(
  torso: ReadonlyArray<FoxZonePoly>,
  count: number,
  bandFraction = 0.20,
): SpikeAnchor[] {
  const bb = polysBBox(torso);
  if (!bb || count <= 0) return [];
  const diagonal = Math.hypot(bb.w, bb.h);

  // Find boundary edges (shared by only 1 torso facet)
  const edgeCounts = new Map<string, { count: number; poly: FoxZonePoly }>();
  for (const poly of torso) {
    const pts = parsePts(poly.points);
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      if (!a || !b) continue;
      const key =
        a[0] < b[0] || (a[0] === b[0] && a[1] < b[1])
          ? `${a[0]},${a[1]}-${b[0]},${b[1]}`
          : `${b[0]},${b[1]}-${a[0]},${a[1]}`;
      const ex = edgeCounts.get(key);
      if (ex) ex.count++;
      else edgeCounts.set(key, { count: 1, poly });
    }
  }

  // Pool of boundary vertices strictly near top band
  const boundaryVerts: Array<{ pt: Pt; poly: FoxZonePoly }> = [];
  for (const [key, entry] of edgeCounts.entries()) {
    if (entry.count === 1) {
      const [p1Str] = key.split("-");
      if (p1Str) {
        const [x, y] = p1Str.split(",").map(Number);
        if (x !== undefined && y !== undefined && y <= bb.minY + bb.h * bandFraction) {
          boundaryVerts.push({ pt: [x, y], poly: entry.poly });
        }
      }
    }
  }

  const pool = boundaryVerts.length > 0
    ? boundaryVerts
    : torso.flatMap((p) => parsePts(p.points).map((pt) => ({ pt, poly: p })));

  const anchors: SpikeAnchor[] = [];
  const minGap = (bb.w * 0.35) / Math.max(1, count);

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : 0.16 + (0.68 * i) / (count - 1);
    const tx = bb.minX + bb.w * t;
    let best: { pt: Pt; poly: FoxZonePoly } | null = null;
    let bestScore = Infinity;

    for (const v of pool) {
      if (anchors.some((a) => Math.abs(a.x - v.pt[0]) < minGap)) continue;
      const score = v.pt[1] + Math.abs(v.pt[0] - tx) * 1.4;
      if (score < bestScore) {
        bestScore = score;
        best = v;
      }
    }

    if (best) {
      const dx = best.pt[0] - bb.cx;
      // Force upward direction (-uy) with outward angle
      const ux = dx === 0 ? (i % 2 === 0 ? -0.4 : 0.4) : (dx / (bb.w * 0.5));
      const uy = -1.0;
      const len = Math.hypot(ux, uy) || 1;

      anchors.push({
        x: best.pt[0],
        y: best.pt[1],
        ux: ux / len,
        uy: uy / len,
        color: best.poly.defaultFill,
        maxLen: diagonal * (0.05 + 0.012 * i), // 5%..8% of torso diagonal
      });
    }
  }

  return anchors.sort((a, b) => a.x - b.x);
}

/** Deterministic PRNG */
export function mulberry32(seedFloat: number): () => number {
  let a = Math.floor(Math.abs(seedFloat) * 1e6) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function idHash01(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

// ── colour helpers ──────────────────────────────────────────────────────────

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m || !m[1]) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: RGB): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${((1 << 24) | (c(r) << 16) | (c(g) << 8) | c(b)).toString(16).slice(1)}`;
}

const lum = ([r, g, b]: RGB) => 0.299 * r + 0.587 * g + 0.114 * b;

function mixRgb(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// ── zone colour/transform modifiers (Strength / Intelligence / Endurance / Creativity) ──────

type FoxAttrs = NonNullable<AvatarParams["foxAttributes"]>;

export interface FoxZoneModifiers {
  zoneTransforms: Record<string, string>;
  resolveFill: (poly: FoxZonePoly) => string | undefined;
  torsoTransform: string | undefined;
}

export function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Calculates scar color by taking the base body color (hex), converting to HSL,
 * and increasing Lightness by `lightnessShift` % (+20% by default), keeping Hue & Saturation.
 */
export function getScarColor(colorHex: string, lightnessShift = 20): string {
  const rgb = hexToRgb(colorHex);
  if (!rgb) return colorHex;
  const [h, s, l] = rgbToHsl(rgb);
  const newL = Math.min(95, l + lightnessShift);
  return `hsl(${h}, ${s}%, ${newL}%)`;
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

/**
 * Finds the REAL attachment point of the tail to the torso.
 * Calculated as the vertex in tail polygons closest to torso center.
 */
export function getTailAttachmentPoint(tier: FoxTierIndex): { x: number; y: number } {
  const torso = getZonePolys(tier, "torso");
  const torsoBb = polysBBox(torso);
  const targetX = torsoBb ? torsoBb.cx : 100;
  const targetY = torsoBb ? torsoBb.cy : 100;

  const tailPolys = [
    ...getZonePolys(tier, "tail"),
    ...getZonePolys(tier, "tailTip"),
    ...getZonePolys(tier, "tail_tip"),
    ...getZonePolys(tier, "tailArray"),
  ];

  let bestPt = { x: targetX, y: targetY };
  let minD = Infinity;

  for (const poly of tailPolys) {
    for (const [x, y] of parsePts(poly.points)) {
      const d = (x - targetX) ** 2 + (y - targetY) ** 2;
      if (d < minD) {
        minD = d;
        bestPt = { x, y };
      }
    }
  }
  return bestPt;
}

/** Zones never dimmed by Focus depth-of-field: the head stays at full colour so it reads as the focal point */
const DOF_EXEMPT_ZONES: ReadonlySet<string> = new Set([
  "head",
  "eyes",
  "ears",
  "ear_far",
  "ear_near",
  "snout",
  "unassigned",
]);

/** Depth of field at Focus=18: saturation → 45% (mix 0.55 to grey), brightness → 88% */
const DOF_DESATURATE = 0.55;
const DOF_DIM = 0.12;

/** Tiers where torso & limb scale (Strength) is allowed: L2/L3/L4/L5 (not curled L1) */
const STRENGTH_SCALE_TIERS: ReadonlySet<FoxTierIndex> = new Set<FoxTierIndex>([2, 3, 4, 5]);

import { CLASS_BODY_PALETTE, remapFacetColorToClass, type ClassArchetype } from "../../creatureFxPalette";
export { CLASS_BODY_PALETTE, type ClassArchetype };

export function computeFoxZoneModifiers(
  tier: FoxTierIndex,
  fox: FoxAttrs | undefined,
  creativityParams?: { intensity: number; seed: number },
  classArchetype: ClassArchetype = "explorer",
): FoxZoneModifiers {
  const none: FoxZoneModifiers = {
    zoneTransforms: {},
    resolveFill: (poly) => (classArchetype !== "explorer" ? remapFacetColorToClass(poly.defaultFill, classArchetype) : undefined),
    torsoTransform: undefined,
  };
  if (!fox && !creativityParams && classArchetype === "explorer") return none;

  const zoneTransforms: Record<string, string> = {};
  let torsoTransform: string | undefined;

  const strengthN = fox ? Math.max(0, Math.min(1, (fox.strength.coreScale - 1) / 0.08)) : 0;
  const contrastK = 1 + strengthN * 0.4;
  const dof = fox ? Math.max(0, Math.min(1, fox.focus.depthOfField)) : 0;
  const disciplineDisorder = fox ? 1 - Math.max(0, Math.min(1, fox.discipline.poseSymmetryEmphasis)) : 0;

  const strengthZones = ["torso", ...(LIMB_ZONES_BY_TIER[tier] ?? [])];

  if (fox && STRENGTH_SCALE_TIERS.has(tier) && fox.strength.coreScale > 1.001) {
    for (const z of strengthZones) {
      const bb = polysBBox(getZonePolys(tier, z));
      if (bb) {
        const s = fox.strength.coreScale;
        const tr = `translate(${bb.cx} ${bb.cy}) scale(${s}) translate(${-bb.cx} ${-bb.cy})`;
        zoneTransforms[z] = tr;
        if (z === "torso") torsoTransform = tr;
      }
    }
  }

  // Creativity: deterministically pick 1..3 asymmetrical facets in head/torso/tailTip by seed
  const cIntensity = creativityParams?.intensity ?? 0;
  const cSeed = creativityParams?.seed ?? 0;
  const creativeCount = cIntensity >= 0.75 ? 3 : cIntensity >= 0.45 ? 2 : cIntensity >= 0.15 ? 1 : 0;

  // Seed-variable accent hue (±40 deg shift around base purple 285 deg)
  const seedPRNG = mulberry32(cSeed + 0.718);
  const hueShift = (seedPRNG() - 0.5) * 80; // -40 deg .. +40 deg
  const accentHue = (285 + hueShift + 360) % 360;
  const creativeAccentRgb = hslToRgb(accentHue, 85, 60);

  const allPolys = getTierPolys(tier);
  const eligiblePolys = allPolys.filter(
    (p) => p.zone === "head" || p.zone === "torso" || p.zone === "tailTip" || p.zone === "tail_tip"
  );
  const creativeFacetIds = new Set<string>();

  if (creativeCount > 0 && eligiblePolys.length > 0) {
    const prng = mulberry32(cSeed + 0.317);
    for (let i = 0; i < creativeCount * 4 && creativeFacetIds.size < creativeCount; i++) {
      const idx = Math.floor(prng() * eligiblePolys.length);
      const chosen = eligiblePolys[idx];
      if (chosen) creativeFacetIds.add(chosen.id);
    }
  }

  // Social warm tinting on tail base/mid (0..0.45 warm amber-orange shift)
  const socialWarmShift = fox?.social ? fox.social.collarWarmShift : 0;

  const resolveFill = (poly: FoxZonePoly): string | undefined => {
    let rawDefaultFill = poly.defaultFill;
    if (classArchetype !== "explorer") {
      rawDefaultFill = remapFacetColorToClass(poly.defaultFill, classArchetype);
    }

    // Creativity accent tint: vibrant seed-variable aura mix on chosen asymmetric facets
    if (creativeFacetIds.has(poly.id) && cIntensity > 0.1) {
      const base = hexToRgb(rawDefaultFill);
      if (base) {
        return rgbToHex(mixRgb(base, creativeAccentRgb, Math.min(0.55, cIntensity * 0.5)));
      }
    }

    // Social warm tint on tail base/mid polygons and ears polygons (excluding tailTip)
    const isTailBase =
      (poly.zone === "tail" || poly.zone === "tailArray") &&
      !poly.id.includes("tip");
    const isEars =
      poly.zone === "ears" ||
      poly.zone.includes("ear");

    if ((isTailBase || isEars) && socialWarmShift > 0.05) {
      const base = hexToRgb(rawDefaultFill);
      if (base) {
        const warmRgb: RGB = [249, 115, 22]; // Warm coral-amber tone
        const mixRatio = isEars
          ? Math.min(0.25, socialWarmShift * 0.28)
          : Math.min(0.20, socialWarmShift * 0.22);
        return rgbToHex(mixRgb(base, warmRgb, mixRatio));
      }
    }

    const needClassRemap = classArchetype !== "explorer";
    const needStrength = strengthZones.includes(poly.zone) && strengthN > 0.001;
    const needDof = dof > 0.001 && !DOF_EXEMPT_ZONES.has(poly.zone);
    const needDisciplineOrder = poly.zone === "torso" && disciplineDisorder > 0.001;
    if (!needClassRemap && !needStrength && !needDof && !needDisciplineOrder) {
      return classArchetype !== "explorer" ? rawDefaultFill : undefined;
    }

    const base = hexToRgb(rawDefaultFill);
    if (!base) return undefined;
    let c: RGB = base;

    if (needStrength) {
      // Strength: local facet contrast (torso & limbs)
      if (strengthN > 0.001) {
        const k = 1 + (contrastK - 1) * (0.5 + 0.5 * idHash01(poly.id));
        c = [(c[0] - 128) * k + 128, (c[1] - 128) * k + 128, (c[2] - 128) * k + 128];
      }
    }

    // Focus depth of field: body (torso/limbs/tail) loses saturation and brightness; head is exempt
    if (needDof) {
      const l = lum(c);
      c = mixRgb(c, [l, l, l], dof * DOF_DESATURATE);
      const dim = 1 - dof * DOF_DIM;
      c = [c[0] * dim, c[1] * dim, c[2] * dim];
    }

    // Discipline order / jitter (3rd channel):
    // Low Discipline -> random ±10% brightness variation around facet's base color (creates subtle tone irregularity across torso)
    // High Discipline -> 0% variation (clean, uniform, unperturbed facet tones)
    if (needDisciplineOrder) {
      const randShift = (idHash01(poly.id) - 0.5) * 2; // -1.0 .. +1.0
      const jitterFactor = 1 + randShift * 0.18 * disciplineDisorder; // ±18% range
      c = [
        Math.max(0, Math.min(255, c[0] * jitterFactor)),
        Math.max(0, Math.min(255, c[1] * jitterFactor)),
        Math.max(0, Math.min(255, c[2] * jitterFactor)),
      ];
    }

    return rgbToHex(c);
  };

  return { zoneTransforms, resolveFill, torsoTransform };
}
