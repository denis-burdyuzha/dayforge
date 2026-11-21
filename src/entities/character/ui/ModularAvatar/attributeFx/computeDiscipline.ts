/**
 * Discipline — crystal order (canvas space). Discipline owns the space around the silhouette BELOW the
 * top 35% of the canvas (the top band belongs to Social).
 *
 * Slots: 16 points evenly spread on an ellipse inscribed in the canvas with a 14px margin. A slot is free
 * when the whole crystal lies below the top band, inside the canvas and outside the silhouette with a
 * ≥4px gap. fxStep(v, 6) crystals take free slots evenly along the available arc (start slot from seed);
 * if there are fewer free slots, only those are used.
 * Chaos → order: each crystal is moved from its slot by a seeded vector of 35% of the neighbour-slot
 * distance (v=2) → 0 (v=18); if the offset breaks a constraint it is shrunk for that crystal.
 */

import type { Pt } from "./anatomy";
import { FX_CANVAS, FX_TOP_BAND, type FxContext } from "./fxContext";
import { fxRng, fxStep } from "./fxSeed";

export const DISCIPLINE_SLOT_COUNT = 16;
export const DISCIPLINE_ELLIPSE_MARGIN = 14;
export const DISCIPLINE_SILHOUETTE_GAP = 4;
/** static in-plane tilt range of a crystal, degrees */
const MAX_TILT_DEG = 15;

export interface DisciplineCrystal {
  p: Pt;
  /** static in-plane tilt, degrees */
  tilt: number;
  slot: number;
}

export interface DisciplineFormationGeometry {
  crystalSize: number;
  /** half extents (canvas px) of a crystal box size × 1.6·size tilted by up to ±15° */
  halfW: number;
  halfH: number;
  /** circumradius of the crystal box (canvas px) — rotation-independent clearance radius */
  radius: number;
  slots: Pt[];
  freeSlots: number[];
  crystals: DisciplineCrystal[];
}

/** All 16 slot positions (canvas) — independent of the creature */
export function disciplineSlots(): Pt[] {
  const cx = FX_CANVAS.w / 2;
  const cy = FX_CANVAS.h / 2;
  const a = cx - DISCIPLINE_ELLIPSE_MARGIN;
  const b = cy - DISCIPLINE_ELLIPSE_MARGIN;
  return Array.from({ length: DISCIPLINE_SLOT_COUNT }, (_, k) => {
    const t = (k / DISCIPLINE_SLOT_COUNT) * Math.PI * 2;
    return [cx + a * Math.cos(t), cy + b * Math.sin(t)] as Pt;
  });
}

export function computeDisciplineCrystals(ctx: FxContext): DisciplineFormationGeometry | null {
  const v = ctx.values.discipline;
  const n = fxStep(v, 6);
  if (n === 0) return null;
  const { crystalSize, distanceTo } = ctx.silhouette;
  // Half extents of the crystal box (size × 1.6·size) tilted by up to ±MAX_TILT_DEG
  const t = (MAX_TILT_DEG * Math.PI) / 180;
  const w0 = crystalSize / 2;
  const h0 = crystalSize * 0.8;
  const halfW = w0 * Math.cos(t) + h0 * Math.sin(t);
  const halfH = h0 * Math.cos(t) + w0 * Math.sin(t);
  const radius = Math.hypot(w0, h0);
  const bandY = FX_CANVAS.h * FX_TOP_BAND;

  const fits = (p: Pt): boolean =>
    p[0] - halfW >= 0 &&
    p[0] + halfW <= FX_CANVAS.w &&
    p[1] - halfH >= bandY &&
    p[1] + halfH <= FX_CANVAS.h &&
    distanceTo(p) >= radius + DISCIPLINE_SILHOUETTE_GAP;

  const slots = disciplineSlots();
  const freeSlots = slots.map((p, k) => (fits(p) ? k : -1)).filter((k) => k >= 0);
  if (freeSlots.length === 0) {
    return { crystalSize, halfW, halfH, radius, slots, freeSlots, crystals: [] };
  }

  const rng = fxRng(ctx.seedKey, "discipline");
  const count = Math.min(n, freeSlots.length);
  const start = Math.floor(rng() * freeSlots.length);
  const chosen: number[] = [];
  for (let i = 0; i < count; i++) {
    const idx = (start + Math.round((i * freeSlots.length) / count)) % freeSlots.length;
    const slot = freeSlots[idx]!;
    if (!chosen.includes(slot)) chosen.push(slot);
  }

  const s0 = slots[0]!;
  const s1 = slots[1]!;
  const slotSpacing = Math.hypot(s1[0] - s0[0], s1[1] - s0[1]);
  const offsetK = v >= 18 ? 0 : Math.max(0, Math.min(0.35, 0.35 * (1 - (v - 2) / 16)));
  const minSep = crystalSize * 2.1;

  const crystals: DisciplineCrystal[] = [];
  for (const slot of chosen) {
    const base = slots[slot]!;
    const phi = rng() * Math.PI * 2;
    const tilt = (rng() * 2 - 1) * MAX_TILT_DEG;
    const full = offsetK * slotSpacing;
    let placed: Pt = base;
    for (const k of [1, 0.75, 0.5, 0.25, 0]) {
      const p: Pt = [base[0] + Math.cos(phi) * full * k, base[1] + Math.sin(phi) * full * k];
      const clear = crystals.every((c) => Math.hypot(c.p[0] - p[0], c.p[1] - p[1]) >= minSep);
      if (fits(p) && clear) {
        placed = p;
        break;
      }
    }
    crystals.push({ p: placed, tilt, slot });
  }
  return { crystalSize, halfW, halfH, radius, slots, freeSlots, crystals };
}
