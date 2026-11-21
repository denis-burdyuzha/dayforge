/**
 * Body tone modifiers applied to the asset fill (no geometry change):
 *  • Discipline — torso facet brightness scatter ±18% (v=1) → 0 (v=18)
 * Only polygons of the anatomy torso zones are touched.
 */

import { fxHash01, fxNorm } from "./fxSeed";

interface TonePoly {
  id: string;
  zone: string;
  defaultFill: string;
}

export function createBodyToneResolver(input: {
  torsoZones: ReadonlyArray<string>;
  discipline: number;
  seedKey: string;
}): (poly: TonePoly) => string | undefined {
  const torso = new Set(input.torsoZones);
  const scatter = 0.18 * (1 - fxNorm(input.discipline));
  if (scatter <= 0.0001) return () => undefined;

  return (poly) => {
    if (!torso.has(poly.zone)) return undefined;
    const m = /^#([0-9a-f]{6})$/i.exec(poly.defaultFill.trim());
    if (!m || !m[1]) return undefined;
    const n = parseInt(m[1], 16);
    const rgb0 = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    const k = 1 + (fxHash01(`${input.seedKey}:discipline-tone:${poly.id}`) - 0.5) * 2 * scatter;
    const rgb = rgb0.map((c) => c * k);
    const c = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    return `#${((1 << 24) | (c(rgb[0]!) << 16) | (c(rgb[1]!) << 8) | c(rgb[2]!)).toString(16).slice(1)}`;
  };
}
