/**
 * Tier FX matrix types shared by the low-poly creatures (FOX_FX_MATRIX, WOLF_FX_MATRIX).
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
