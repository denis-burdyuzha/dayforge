/**
 * Body tone modifier applied to the asset fill (no geometry change):
 *  • Strength — torso facet contrast ×1.0 (v=1) → ×1.25 (v=18)
 * Only polygons of the anatomy torso zones are touched. At Strength = 1 nothing changes.
 */

import { fxNorm } from "./fxSeed";

interface TonePoly {
  id: string;
  zone: string;
  defaultFill: string;
}

export function createBodyToneResolver(input: {
  torsoZones: ReadonlyArray<string>;
  strength: number;
}): (poly: TonePoly) => string | undefined {
  const torso = new Set(input.torsoZones);
  const contrast = 1 + 0.25 * fxNorm(input.strength);
  if (contrast <= 1.0001) return () => undefined;

  return (poly) => {
    if (!torso.has(poly.zone)) return undefined;
    const m = /^#([0-9a-f]{6})$/i.exec(poly.defaultFill.trim());
    if (!m || !m[1]) return undefined;
    const n = parseInt(m[1], 16);
    const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => (c - 128) * contrast + 128);
    const c = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    return `#${((1 << 24) | (c(rgb[0]!) << 16) | (c(rgb[1]!) << 8) | c(rgb[2]!)).toString(16).slice(1)}`;
  };
}
