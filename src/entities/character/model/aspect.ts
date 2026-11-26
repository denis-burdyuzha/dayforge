/**
 * aspect.ts — dominant attribute "aspect" of a character.
 *
 * The body of the avatar carries no attribute effects. The strongest attribute (≥ 3) becomes the
 * aspect: it colours the rim light and the aura of the avatar (all classes). Fills/facets never change.
 * All 7 attributes are shown separately by the rune ring (ui/AttributeRuneRing).
 */

import type { AttributeKey } from "./types";

/** Canonical attribute order: tie-break order of the aspect and clockwise order of the rune ring */
export const ATTRIBUTE_ORDER: readonly AttributeKey[] = [
  "strength",
  "endurance",
  "intelligence",
  "focus",
  "discipline",
  "social",
  "creativity",
] as const;

export const ATTRIBUTE_COLORS: Record<AttributeKey, string> = {
  strength: "#ef4444",
  endurance: "#22c55e",
  intelligence: "#38bdf8",
  focus: "#2dd4bf",
  discipline: "#facc15",
  social: "#f472b6",
  creativity: "#a78bfa",
};

export const ATTRIBUTE_LABELS_RU: Record<AttributeKey, string> = {
  strength: "Сила",
  endurance: "Выносливость",
  intelligence: "Интеллект",
  focus: "Фокус",
  discipline: "Дисциплина",
  social: "Социальность",
  creativity: "Креативность",
};

export function isAttributeKey(code: string): code is AttributeKey {
  return (ATTRIBUTE_ORDER as readonly string[]).includes(code);
}

/** Minimum attribute value that can become the aspect */
export const ASPECT_MIN_VALUE = 3;

export type AttributeValues = Partial<Record<AttributeKey, number>>;

/**
 * The aspect: the attribute with the maximum value, but only if that value is ≥ 3 AND strictly greater than
 * the second-largest value. Any tie at the top → null (no aspect).
 */
export function getAspect(attributes: AttributeValues): AttributeKey | null {
  let best: AttributeKey | null = null;
  let bestValue = -Infinity;
  let secondValue = -Infinity;
  for (const key of ATTRIBUTE_ORDER) {
    const v = attributes[key] ?? 0;
    if (v > bestValue) {
      secondValue = bestValue;
      best = key;
      bestValue = v;
    } else if (v > secondValue) {
      secondValue = v;
    }
  }
  if (best === null || bestValue < ASPECT_MIN_VALUE || bestValue <= secondValue) return null;
  return best;
}

/** 3 → 0.35, 18 → 1.0, linear (clamped) */
export function getAspectIntensity(value: number): number {
  const t = (value - ASPECT_MIN_VALUE) / (18 - ASPECT_MIN_VALUE);
  return 0.35 + 0.65 * Math.min(1, Math.max(0, t));
}

export interface AvatarAspect {
  attribute: AttributeKey;
  color: string;
  /** 0.35..1 — multiplies rim light and aura opacity */
  intensity: number;
}

export function resolveAvatarAspect(attributes: AttributeValues): AvatarAspect | null {
  const attribute = getAspect(attributes);
  if (!attribute) return null;
  return {
    attribute,
    color: ATTRIBUTE_COLORS[attribute],
    intensity: getAspectIntensity(attributes[attribute] ?? ASPECT_MIN_VALUE),
  };
}

/** Rim light / aura of a character without an aspect (all classes): soft white at a fixed intensity */
export const NEUTRAL_GLOW_COLOR = "#e2e8f0";
export const NEUTRAL_GLOW_INTENSITY = 0.5;

/**
 * Rim light + aura of a renderer tier, recoloured and scaled by the aspect (or the neutral glow).
 * Early tiers have no rim/aura at all (fox L1: 0), so a minimum ("floor") rim and aura is guaranteed —
 * otherwise the aspect would be invisible there. Opacity is then × intensity.
 */
export interface GlowConfig {
  rimOpacity: number;
  rimStrokeWidth: number;
  auraOpacity: number;
  auraRadius: number;
}

export const ASPECT_GLOW_FLOOR: GlowConfig = {
  rimOpacity: 0.85,
  rimStrokeWidth: 3.5,
  auraOpacity: 0.55,
  /** must reach past the silhouette (canvas half-width = 100), otherwise the body hides the aura */
  auraRadius: 95,
};

export function applyAspectGlow(
  tier: GlowConfig,
  aspect: AvatarAspect | null,
): GlowConfig & { color: string } {
  const color = aspect?.color ?? NEUTRAL_GLOW_COLOR;
  const intensity = aspect?.intensity ?? NEUTRAL_GLOW_INTENSITY;
  return {
    color,
    rimOpacity: Math.max(tier.rimOpacity, ASPECT_GLOW_FLOOR.rimOpacity) * intensity,
    rimStrokeWidth: Math.max(tier.rimStrokeWidth, ASPECT_GLOW_FLOOR.rimStrokeWidth),
    auraOpacity: Math.max(tier.auraOpacity, ASPECT_GLOW_FLOOR.auraOpacity) * intensity,
    auraRadius: Math.max(tier.auraRadius, ASPECT_GLOW_FLOOR.auraRadius),
  };
}

// ── Colour helpers (HSL) ──

function hexToHsl(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m || !m[1]) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r
      ? ((g - b) / d + (g < b ? 6 : 0)) / 6
      : max === g
        ? ((b - r) / d + 2) / 6
        : ((r - g) / d + 4) / 6;
  return [h, s, l];
}

/**
 * Warm accent colour (orange/amber/yellow/rust, e.g. glowing fox tail tips and their shaded facets):
 * hue 300°–70°, saturation > minSaturation, lightness > minLightness.
 */
export function isWarmAccent(hex: string, minSaturation = 0.35, minLightness = 0.25): boolean {
  const hsl = hexToHsl(hex);
  if (!hsl) return false;
  const deg = hsl[0] * 360;
  return (deg < 70 || deg > 300) && hsl[1] > minSaturation && hsl[2] > minLightness;
}
