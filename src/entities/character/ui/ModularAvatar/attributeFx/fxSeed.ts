/**
 * Deterministic seeds and value steps for the universal attribute FX system.
 * Same character → same picture on every render; different characters → different picture.
 */

import { fnv1a } from "../../../model/avatarIdentity";

/** Mulberry32 PRNG → floats in [0, 1) */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** PRNG seeded by character key + attribute name (+ optional salt) */
export function fxRng(seedKey: string, attribute: string, salt = ""): () => number {
  return mulberry32(fnv1a(`${seedKey}:${attribute}:${salt}`));
}

/** Deterministic 0..1 hash of a string */
export function fxHash01(text: string): number {
  return (fnv1a(text) % 100000) / 100000;
}

/**
 * Attribute value (1..18) → discrete FX step.
 * 1 → 0 (effect not rendered at all); 18 → maxSteps;
 * otherwise floor((v − 1) / 17 × maxSteps), but at least 1 for v ≥ 2.
 */
export function fxStep(value: number, maxSteps: number): number {
  if (!Number.isFinite(value) || value <= 1) return 0;
  if (value >= 18) return maxSteps;
  return Math.max(1, Math.floor(((value - 1) / 17) * maxSteps));
}

/** Attribute value (1..18) → continuous 0..1 */
export function fxNorm(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, (value - 1) / 17));
}
