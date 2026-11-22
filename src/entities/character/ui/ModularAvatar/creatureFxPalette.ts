/**
 * Shared Class Formation Color Palette & Shading Helpers
 * Serves as the single source of truth for creature attribute FX palettes across all classes.
 */

export const CLASS_FORMATION_COLOR = {
  explorer: "#f59e0b",  // Fox — amber, matches eye/tail-tip accent
  warrior:  "#bae6fd",  // Wolf — icy blue-white
  creator:  "#a78bfa",  // Raven — violet
  strategist: "#2dd4bf", // Owl — teal
  wanderer: "#34d399",  // Deer — emerald
} as const;

export const CLASS_BODY_PALETTE = {
  explorer:   { dark: "#0a1230", mid: "#1e2a4a", light: "#3a4a6e" },
  warrior:    { dark: "#3f0a0a", mid: "#7f1d1d", light: "#b91c1c" },
  creator:    { dark: "#2e1065", mid: "#5b21b6", light: "#8b5cf6" },
  strategist: { dark: "#042f2e", mid: "#0f766e", light: "#2dd4bf" },
  wanderer:   { dark: "#2e1a05", mid: "#78350f", light: "#b45309" },
} as const;

export type ClassArchetype = keyof typeof CLASS_BODY_PALETTE;

/**
 * Calculates a body facet fill color for a given class archetype and relative lightness t ∈ [0, 1].
 * t = 0 -> dark, t = 0.5 -> mid, t = 1.0 -> light.
 */
export function getClassBodyColor(classArchetype: ClassArchetype, t: number): string {
  const palette = CLASS_BODY_PALETTE[classArchetype] ?? CLASS_BODY_PALETTE.explorer;
  const darkRgb = hexToRgb(palette.dark) ?? { r: 10, g: 18, b: 48 };
  const midRgb = hexToRgb(palette.mid) ?? { r: 30, g: 42, b: 74 };
  const lightRgb = hexToRgb(palette.light) ?? { r: 58, g: 74, b: 110 };

  const clampedT = Math.max(0, Math.min(1, t));
  if (clampedT <= 0.5) {
    const k = clampedT / 0.5;
    return rgbToHex(
      darkRgb.r + (midRgb.r - darkRgb.r) * k,
      darkRgb.g + (midRgb.g - darkRgb.g) * k,
      darkRgb.b + (midRgb.b - darkRgb.b) * k,
    );
  } else {
    const k = (clampedT - 0.5) / 0.5;
    return rgbToHex(
      midRgb.r + (lightRgb.r - midRgb.r) * k,
      midRgb.g + (lightRgb.g - midRgb.g) * k,
      midRgb.b + (lightRgb.b - midRgb.b) * k,
    );
  }
}

/**
 * Maps a base hex color (from explorer asset data) to a target class body palette.
 * If classArchetype is 'explorer', returns original hex.
 */
export function remapFacetColorToClass(baseHex: string, classArchetype: ClassArchetype = "explorer"): string {
  if (classArchetype === "explorer") return baseHex;

  const refPalette = CLASS_BODY_PALETTE.explorer;
  const rgb = hexToRgb(baseHex);
  if (!rgb) return baseHex;

  const refDark = hexToRgb(refPalette.dark)!;
  const refLight = hexToRgb(refPalette.light)!;

  const lumRefDark = 0.299 * refDark.r + 0.587 * refDark.g + 0.114 * refDark.b;
  const lumRefLight = 0.299 * refLight.r + 0.587 * refLight.g + 0.114 * refLight.b;
  const lumCurrent = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;

  const t = (lumCurrent - lumRefDark) / Math.max(1, lumRefLight - lumRefDark);
  return getClassBodyColor(classArchetype, t);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Adjusts brightness of a HEX color by a percentage factor (-0.25 = 25% darker, +0.25 = 25% lighter).
 */
export function shadeColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    rgb.r * (1 + percent),
    rgb.g * (1 + percent),
    rgb.b * (1 + percent)
  );
}
