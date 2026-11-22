/**
 * Pure logic of the rune ring: rune visual state by value and ring geometry.
 */

import { ATTRIBUTE_ORDER } from "../../model/aspect";
import type { AttributeKey } from "../../model/types";

export const RUNE_SIZE = 28;
export const ASPECT_RUNE_SCALE = 1.15;
export const RING_RADIUS_FACTOR = 0.46;
export const RUNE_INACTIVE_COLOR = "#64748b";

/** 0: v ≤ 1 · 1: 2–5 (opacity 0.7→0.85) · 2: 6–11 · 3: 12–17 · 4: 18 */
export type RuneLevel = 0 | 1 | 2 | 3 | 4;

export function getRuneLevel(v: number): RuneLevel {
  if (v >= 18) return 4;
  if (v >= 12) return 3;
  if (v >= 6) return 2;
  if (v >= 2) return 1;
  return 0;
}

export interface RuneVisual {
  level: RuneLevel;
  /** glyph colour (attribute colour, grey when inactive) */
  active: boolean;
  opacity: number;
  frame: boolean;
  frameOpacity: number;
  /** glow radius in px (0 = no glow) */
  glow: number;
  ticks: boolean;
}

export function getRuneVisual(v: number): RuneVisual {
  const level = getRuneLevel(v);
  switch (level) {
    case 0:
      return {
        level,
        active: false,
        opacity: 0.25,
        frame: false,
        frameOpacity: 0,
        glow: 0,
        ticks: false,
      };
    case 1:
      return {
        level,
        active: true,
        opacity: 0.7 + ((Math.min(5, Math.max(2, v)) - 2) / 3) * 0.15,
        frame: false,
        frameOpacity: 0,
        glow: 0,
        ticks: false,
      };
    case 2:
      return {
        level,
        active: true,
        opacity: 0.9,
        frame: true,
        frameOpacity: 0.6,
        glow: 0,
        ticks: false,
      };
    case 3:
      return {
        level,
        active: true,
        opacity: 0.9,
        frame: true,
        frameOpacity: 0.6,
        glow: 4,
        ticks: false,
      };
    case 4:
      return {
        level,
        active: true,
        opacity: 1,
        frame: true,
        frameOpacity: 1,
        glow: 8,
        ticks: true,
      };
  }
}

export interface RunePlacement {
  attribute: AttributeKey;
  /** centre offset from the ring centre, px (y down) */
  x: number;
  y: number;
  /** rendered rune box size, px */
  size: number;
}

export interface RingLayout {
  radius: number;
  runes: RunePlacement[];
}

/** Rune box (square, side `s`) centred at (x, y) overlaps the avatar box centred at 0,0 */
function overlapsAvatar(x: number, y: number, s: number, box: { width: number; height: number }) {
  return Math.abs(x) < box.width / 2 + s / 2 && Math.abs(y) < box.height / 2 + s / 2;
}

/**
 * 7 runes evenly on a circle of radius size × 0.46, strength on top, then clockwise in
 * ATTRIBUTE_ORDER. If any rune would overlap the avatar box, the radius grows to the smallest value
 * at which none does.
 */
export function computeRingLayout(
  size: number,
  avatarBox: { width: number; height: number } | null,
  aspect: AttributeKey | null,
): RingLayout {
  const sizes = ATTRIBUTE_ORDER.map((a) =>
    a === aspect ? RUNE_SIZE * ASPECT_RUNE_SCALE : RUNE_SIZE,
  );
  const place = (r: number): RunePlacement[] =>
    ATTRIBUTE_ORDER.map((attribute, k) => {
      const t = (k / ATTRIBUTE_ORDER.length) * Math.PI * 2;
      return { attribute, x: r * Math.sin(t), y: -r * Math.cos(t), size: sizes[k]! };
    });

  let radius = size * RING_RADIUS_FACTOR;
  if (avatarBox) {
    for (let guard = 0; guard < 2000; guard++) {
      const runes = place(radius);
      if (!runes.some((p) => overlapsAvatar(p.x, p.y, p.size, avatarBox))) break;
      radius += 0.5;
    }
  }
  return { radius, runes: place(radius) };
}

/** Aspect sigil diameter relative to the rune-ring area */
export const ASPECT_SIGIL_FACTOR = 0.78;

/** Aspect sigil opacity by the aspect value: 3 → 0.18, 18 → 0.45, linear */
export function getSigilOpacity(value: number): number {
  const t = Math.min(1, Math.max(0, (value - 3) / 15));
  return 0.18 + 0.27 * t;
}

/** Aspect sigil line width, px: 3 at value 3 → 5 at 18, linear */
export function getSigilStrokePx(value: number): number {
  const t = Math.min(1, Math.max(0, (value - 3) / 15));
  return 3 + 2 * t;
}

/** Aspect sigil glow radius, px: none below 12, 6px from 12, 10px at 18 */
export function getSigilGlowPx(value: number): number {
  if (value >= 18) return 10;
  if (value >= 12) return 6;
  return 0;
}
