/**
 * Aspect accent — recolours the marked polygons of a creature asset (`aspectAccentIds`) into the aspect
 * colour. Shared by all creatures.
 *
 * Done in OKLCH (perceptual), relative to the whole accent group:
 * - lightness: the group's lightness range is linearly remapped into [0.45, 0.82] (darkest facet → 0.45,
 *   lightest → 0.82, order kept) — a very light source (pale crystals) would otherwise cap the chroma of
 *   any aspect colour and give pastel tints. A group with a spread below 0.08 is centred on 0.65 and
 *   spread to ±0.08 by its original order;
 * - chroma: every facet gets at least 85 % of the maximum chroma sRGB can show at its (new) lightness and
 *   hue; facets that were more / less saturated than the group mean get up to 100 % / 85 %;
 * - hue = aspect hue + half of the facet's offset from the group's mean hue (±25° max), so facets that
 *   differed by hue (crystal faces, a warm gradient) stay distinct.
 * No aspect → original colours; an empty id list → nothing to do.
 */

export interface AccentPolygon {
  id: string;
  defaultFill: string;
}

type Oklch = { L: number; C: number; h: number };

const HUE_FOLLOW = 0.5;
const HUE_SPREAD_MAX = 25;
/** target lightness range of an accent group */
const L_MIN = 0.45;
const L_MAX = 0.82;
/** below this spread the group is centred on L_CENTER and spread to ±L_FLAT_SPREAD */
const L_MIN_SPREAD = 0.08;
const L_CENTER = 0.65;
const L_FLAT_SPREAD = 0.08;
/** facet chroma = this share … 100 % of the sRGB maximum, by its chroma relative to the group */
const CHROMA_FLOOR = 0.85;
/** relative-chroma range (facet / group mean) mapped onto CHROMA_FLOOR … 1 */
const REL_C_LOW = 0.45;
const REL_C_HIGH = 1.5;

// ── colour conversions (sRGB ↔ OKLab, Björn Ottosson) ──

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1]!;
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function rgbToOklch([r, g, b]: [number, number, number]): Oklch {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B);
  const h = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { L, C, h };
}

/** linear-light sRGB of an OKLCH colour (may be out of [0, 1]) */
function oklchToLinearRgb({ L, C, h }: Oklch): [number, number, number] {
  const rad = (h * Math.PI) / 180;
  const A = C * Math.cos(rad);
  const B = C * Math.sin(rad);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb: [number, number, number]) => rgb.every((c) => c >= -1e-4 && c <= 1 + 1e-4);

/** OKLCH → #rrggbb; out-of-gamut colours lose chroma until they fit (lightness and hue kept) */
export function oklchToHex(color: Oklch): string {
  let lo = 0;
  let hi = color.C;
  let rgb = oklchToLinearRgb(color);
  if (!inGamut(rgb)) {
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinearRgb({ ...color, C: mid }))) lo = mid;
      else hi = mid;
    }
    rgb = oklchToLinearRgb({ ...color, C: lo });
  }
  const to255 = (c: number) =>
    Math.round(Math.min(1, Math.max(0, toGamma(Math.min(1, Math.max(0, c))))) * 255);
  return `#${((1 << 24) | (to255(rgb[0]) << 16) | (to255(rgb[1]) << 8) | to255(rgb[2])).toString(16).slice(1)}`;
}

/** Largest chroma sRGB can show at this lightness and hue */
export function maxChroma(L: number, h: number): number {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToLinearRgb({ L, C: mid, h }))) lo = mid;
    else hi = mid;
  }
  return lo;
}

export function hexToOklch(hex: string): Oklch | null {
  const rgb = parseHex(hex);
  return rgb ? rgbToOklch(rgb) : null;
}

/** signed shortest difference a − b in degrees, in (−180, 180] */
const hueDelta = (a: number, b: number) => ((a - b + 540) % 360) - 180;

/**
 * New fills for the accent polygons (id → #hex) in the aspect colour. Polygons whose fill is not a hex
 * colour are left out (they keep their fill).
 */
export function recolorAccentGroup(
  polygons: ReadonlyArray<AccentPolygon>,
  aspectColor: string,
): Map<string, string> {
  const result = new Map<string, string>();
  const target = hexToOklch(aspectColor);
  if (!target || polygons.length === 0) return result;

  const src = polygons
    .map((p) => ({ id: p.id, c: hexToOklch(p.defaultFill) }))
    .filter((x): x is { id: string; c: Oklch } => x.c !== null);
  if (src.length === 0) return result;

  // group means: chroma, and the chroma-weighted circular mean of the hue
  const meanC = src.reduce((s, x) => s + x.c.C, 0) / src.length;
  let hx = 0;
  let hy = 0;
  for (const { c } of src) {
    hx += c.C * Math.cos((c.h * Math.PI) / 180);
    hy += c.C * Math.sin((c.h * Math.PI) / 180);
  }
  const meanH = ((Math.atan2(hy, hx) * 180) / Math.PI + 360) % 360;

  // group lightness range → [L_MIN, L_MAX] (or a flat group → centred, ±L_FLAT_SPREAD)
  const lMin = Math.min(...src.map((x) => x.c.L));
  const lMax = Math.max(...src.map((x) => x.c.L));
  const spread = lMax - lMin;
  const [outLo, outHi] =
    spread < L_MIN_SPREAD ? [L_CENTER - L_FLAT_SPREAD, L_CENTER + L_FLAT_SPREAD] : [L_MIN, L_MAX];
  const remapL = (L: number) =>
    spread < 1e-6 ? L_CENTER : outLo + ((L - lMin) / spread) * (outHi - outLo);

  for (const { id, c } of src) {
    const L = remapL(c.L);
    const relC = meanC > 1e-4 ? c.C / meanC : 1;
    const t = Math.min(1, Math.max(0, (relC - REL_C_LOW) / (REL_C_HIGH - REL_C_LOW)));
    // hue offsets of nearly grey facets are noise, and a facet of another hue family (e.g. blue eyes
    // in a group of orange tail tips) is not a gradient step — both follow the aspect hue exactly
    const delta = hueDelta(c.h, meanH);
    const offset = c.C > 0.02 && Math.abs(delta) <= 90 ? delta * HUE_FOLLOW : 0;
    const h = (target.h + Math.max(-HUE_SPREAD_MAX, Math.min(HUE_SPREAD_MAX, offset)) + 360) % 360;
    const C = maxChroma(L, h) * (CHROMA_FLOOR + (1 - CHROMA_FLOOR) * t);
    result.set(id, oklchToHex({ L, C, h }));
  }
  return result;
}

// Asset polygon arrays and accent id lists are module-level constants, so the recolour of a tier in a
// colour is computed once (≈4 ms for ~350 polygons) instead of on every mount of the asset.
const fillCache = new WeakMap<
  ReadonlyArray<AccentPolygon>,
  WeakMap<ReadonlyArray<string>, Map<string, Map<string, string>>>
>();

function cachedFills(
  polygons: ReadonlyArray<AccentPolygon>,
  accentIds: ReadonlyArray<string>,
  aspectColor: string,
): Map<string, string> {
  let byIds = fillCache.get(polygons);
  if (!byIds) fillCache.set(polygons, (byIds = new WeakMap()));
  let byColor = byIds.get(accentIds);
  if (!byColor) byIds.set(accentIds, (byColor = new Map()));
  let fills = byColor.get(aspectColor);
  if (!fills) {
    const ids = new Set(accentIds);
    fills = recolorAccentGroup(
      polygons.filter((p) => ids.has(p.id)),
      aspectColor,
    );
    byColor.set(aspectColor, fills);
  }
  return fills;
}

/**
 * Fill resolver for an asset renderer: the recoloured fill for accent polygons, undefined for the rest.
 * null when there is nothing to do (no aspect, no accent ids).
 */
export function createAspectAccentResolver(
  polygons: ReadonlyArray<AccentPolygon>,
  accentIds: ReadonlyArray<string> | undefined,
  aspectColor: string | null | undefined,
): ((poly: AccentPolygon) => string | undefined) | null {
  if (!aspectColor || !accentIds || accentIds.length === 0) return null;
  const fills = cachedFills(polygons, accentIds, aspectColor);
  if (fills.size === 0) return null;
  return (poly) => fills.get(poly.id);
}
