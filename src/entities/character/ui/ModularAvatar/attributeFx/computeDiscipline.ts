/**
 * Discipline — crystal order (canvas space).
 * fxStep(v, 6) crystals. Target positions: evenly on a circle around the silhouette, start angle from
 * the seed; radius = max silhouette distance over the target angles + safe gap. Each crystal is moved
 * from its target by a seeded random vector of length 35% × radius (v=2) → 0 (v=18). Whatever the
 * offset, a crystal never comes closer to the silhouette than the safe gap.
 * (Torso tone scatter ±18% → 0 is applied to the asset fill in bodyTone.ts.)
 */

import type { Pt } from "./anatomy";
import type { FxContext } from "./fxContext";
import { fxRng, fxStep } from "./fxSeed";

export interface DisciplineCrystal {
  p: Pt;
  /** static in-plane tilt, degrees */
  tilt: number;
}

export interface DisciplineFormationGeometry {
  center: Pt;
  orbitRadius: number;
  crystalSize: number;
  crystals: DisciplineCrystal[];
}

export function computeDisciplineCrystals(ctx: FxContext): DisciplineFormationGeometry | null {
  const v = ctx.values.discipline;
  const n = fxStep(v, 6);
  if (n === 0) return null;
  const { center, minGap, crystalSize, silhouetteDistance } = ctx.orbit;
  const rng = fxRng(ctx.seedKey, "discipline");
  const start = rng() * Math.PI * 2;
  const angles = Array.from({ length: n }, (_, k) => start + (k / n) * Math.PI * 2);
  const orbitRadius = Math.max(...angles.map((a) => silhouetteDistance(a))) + minGap;
  const offsetK = v >= 18 ? 0 : Math.max(0, Math.min(0.35, 0.35 * (1 - (v - 2) / 16)));

  const safe = (p: Pt): Pt => {
    const a = Math.atan2(p[1] - center[1], p[0] - center[0]);
    const d = Math.hypot(p[0] - center[0], p[1] - center[1]);
    const minD = silhouetteDistance(a) + minGap;
    return d >= minD ? p : [center[0] + Math.cos(a) * minD, center[1] + Math.sin(a) * minD];
  };

  let pts: Pt[] = angles.map((a) => {
    const target: Pt = [
      center[0] + Math.cos(a) * orbitRadius,
      center[1] + Math.sin(a) * orbitRadius,
    ];
    const phi = rng() * Math.PI * 2;
    const mag = offsetK * orbitRadius;
    return safe([target[0] + Math.cos(phi) * mag, target[1] + Math.sin(phi) * mag]);
  });

  // keep crystals from overlapping each other (angular relaxation, then re-apply the safe gap)
  const minSep = crystalSize * 2.1;
  for (let pass = 0; pass < 6; pass++) {
    let moved = false;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i]!;
        const b = pts[j]!;
        const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (d >= minSep) continue;
        moved = true;
        const rot = (p: Pt, delta: number): Pt => {
          const ang = Math.atan2(p[1] - center[1], p[0] - center[0]) + delta;
          const r = Math.hypot(p[0] - center[0], p[1] - center[1]);
          return [center[0] + Math.cos(ang) * r, center[1] + Math.sin(ang) * r];
        };
        const r = Math.max(
          10,
          (Math.hypot(a[0] - center[0], a[1] - center[1]) +
            Math.hypot(b[0] - center[0], b[1] - center[1])) /
            2,
        );
        const delta = (minSep - d) / r / 2 + 0.01;
        pts[i] = rot(a, -delta);
        pts[j] = rot(b, delta);
      }
    }
    pts = pts.map(safe);
    if (!moved) break;
  }

  return {
    center,
    orbitRadius,
    crystalSize,
    crystals: pts.map((p) => ({ p, tilt: (rng() - 0.5) * 30 })),
  };
}
