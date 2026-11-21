/**
 * Focus — spotlight (canvas space). The body is never desaturated or dimmed.
 *  • Vignette: radial gradient centred on the silhouette, transparent inside
 *    0.75 × circumradius(silhouetteBBox), edge opacity 0 (v=1) → 0.55 (v=18).
 *  • Eye glints: a `light` dot r=1.5px at every eye point + glow radius 0 → 6px, opacity up to 0.8.
 */

import type { Pt } from "./anatomy";
import { FX_CANVAS, type FxContext } from "./fxContext";
import { fxNorm } from "./fxSeed";

export interface FocusSpotlight {
  center: Pt;
  innerR: number;
  outerR: number;
  edgeOpacity: number;
  eyes: Pt[];
  glowR: number;
  glowOpacity: number;
}

export function computeFocusSpotlight(ctx: FxContext): FocusSpotlight | null {
  const k = fxNorm(ctx.values.focus);
  if (k <= 0) return null;
  const sb = ctx.geo.silhouetteBBox;
  const center = ctx.toCanvas([sb.cx, sb.cy]);
  const innerR = (Math.hypot(sb.w, sb.h) / 2) * ctx.transform.scale * 0.75;
  const corners: Pt[] = [
    [0, 0],
    [FX_CANVAS.w, 0],
    [0, FX_CANVAS.h],
    [FX_CANVAS.w, FX_CANVAS.h],
  ];
  const farthest = Math.max(...corners.map((c) => Math.hypot(c[0] - center[0], c[1] - center[1])));
  return {
    center,
    innerR,
    outerR: Math.max(farthest, innerR + 20),
    edgeOpacity: 0.55 * k,
    eyes: ctx.geo.eyePoints.map(ctx.toCanvas),
    glowR: 6 * k,
    glowOpacity: 0.8 * k,
  };
}
