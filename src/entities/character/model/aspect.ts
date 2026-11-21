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
  focus: "#e2e8f0",
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

/** Minimum attribute value that can become the aspect */
export const ASPECT_MIN_VALUE = 3;

export type AttributeValues = Partial<Record<AttributeKey, number>>;

/**
 * Attribute with the maximum value if that value is ≥ 3, otherwise null.
 * Ties: the first one in ATTRIBUTE_ORDER wins.
 */
export function getAspect(attributes: AttributeValues): AttributeKey | null {
  let best: AttributeKey | null = null;
  let bestValue = -Infinity;
  for (const key of ATTRIBUTE_ORDER) {
    const v = attributes[key] ?? 0;
    if (v > bestValue) {
      best = key;
      bestValue = v;
    }
  }
  return best !== null && bestValue >= ASPECT_MIN_VALUE ? best : null;
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

/**
 * Rim light + aura of a renderer tier, recoloured and scaled by the aspect.
 * Early tiers have no rim/aura at all (fox L1: 0), so with an aspect a minimum ("floor") rim and aura
 * are guaranteed — otherwise the aspect would be invisible there. Opacity is then × intensity.
 * Without an aspect the tier values and the renderer's own default colour are kept unchanged.
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
  defaultColor: string,
  aspect: AvatarAspect | null,
): GlowConfig & { color: string } {
  if (!aspect) return { ...tier, color: defaultColor };
  return {
    color: aspect.color,
    rimOpacity: Math.max(tier.rimOpacity, ASPECT_GLOW_FLOOR.rimOpacity) * aspect.intensity,
    rimStrokeWidth: Math.max(tier.rimStrokeWidth, ASPECT_GLOW_FLOOR.rimStrokeWidth),
    auraOpacity: Math.max(tier.auraOpacity, ASPECT_GLOW_FLOOR.auraOpacity) * aspect.intensity,
    auraRadius: Math.max(tier.auraRadius, ASPECT_GLOW_FLOOR.auraRadius),
  };
}
