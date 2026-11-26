/**
 * Tier FX matrix types and tier selection shared by all creatures (fox and the SVG-pipeline creatures).
 */

/** Particle system configuration — all fields are independently settable */
export interface ParticleConfig {
  /** Number of particles (0 = no particles) */
  count: number;
  /** Orbit radius from avatar center in SVG px (controls proximity to body) */
  radius: number;
  /** Positional randomness 0..1 (0 = perfect orbit, 1 = fully scattered) */
  jitter: number;
  /** Optional target formation shape driven by Discipline attribute */
  targetShape: "none" | "circle" | "square" | "triangle" | "spiral" | "arc";
  /** Opacity decay speed 0..1 (future use by Endurance channel) */
  decayRate: number;
}

export interface TierFxConfig {
  rimGlowOpacity: number;
  rimStrokeWidth: number;
  /** @deprecated Use particles.count instead — kept for legacy render path */
  particleCount: number;
  particles: ParticleConfig;
  auraOpacity: number;
  auraRadius: number;
  filterStyle: string;
}

/** Tier FX of a creature by level threshold: 1, 3, 5, 10, 20, 35, 50 */
export type TierFxMatrix = Readonly<Record<1 | 3 | 5 | 10 | 20 | 35 | 50, TierFxConfig>>;

/** The tier FX for a level: the entry of the highest threshold ≤ level */
export function pickTierFx(matrix: TierFxMatrix, level: number): TierFxConfig {
  if (level >= 50) return matrix[50];
  if (level >= 35) return matrix[35];
  if (level >= 20) return matrix[20];
  if (level >= 10) return matrix[10];
  if (level >= 5) return matrix[5];
  if (level >= 3) return matrix[3];
  return matrix[1];
}

/** Asset tier (1..5) by level — the same thresholds for every creature: 1–2, 3–9, 10–34, 35–49, 50+ */
export function assetTierForLevel(level: number): 1 | 2 | 3 | 4 | 5 {
  if (level < 3) return 1;
  if (level < 10) return 2;
  if (level < 35) return 3;
  if (level < 50) return 4;
  return 5;
}
