/**
 * The ONLY colour source for attribute FX: body, accent, light (+ derived shades).
 * Effects must not introduce any other hues.
 */

import {
  CLASS_BODY_PALETTE,
  CLASS_FORMATION_COLOR,
  type ClassArchetype,
} from "../creatureFxPalette";

/** Shared light tone for all classes */
export const FX_LIGHT = "#cfe8ff";

export interface FxPalette {
  /** Class body tone */
  body: string;
  /** Class contrast accent */
  accent: string;
  /** Shared light tone */
  light: string;
  /** body lightened by 15% (Strength crest fill) */
  bodyLight: string;
  /** Darkest variant (vignette edge) */
  shadow: string;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m || !m[1]) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${((1 << 24) | (c(r) << 16) | (c(g) << 8) | c(b)).toString(16).slice(1)}`;
}

/** Mix towards white by `amount` (0..1) */
export function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

/** Mix towards black by `amount` (0..1) */
export function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

/** Mix colour `a` towards colour `b` by `amount` (0..1) */
export function mixHex(a: string, b: string, amount: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  if (!x || !y) return a;
  return rgbToHex(
    x[0] + (y[0] - x[0]) * amount,
    x[1] + (y[1] - x[1]) * amount,
    x[2] + (y[2] - x[2]) * amount,
  );
}

/** Palette for a class: body / accent come from the existing class palettes, light is shared. */
export function getFxPalette(classId: string): FxPalette {
  const key: ClassArchetype =
    classId in CLASS_BODY_PALETTE ? (classId as ClassArchetype) : "explorer";
  const body = CLASS_BODY_PALETTE[key].light;
  const accent = CLASS_FORMATION_COLOR[key];
  return {
    body,
    accent,
    light: FX_LIGHT,
    bodyLight: lighten(body, 0.15),
    shadow: darken(body, 1),
  };
}
