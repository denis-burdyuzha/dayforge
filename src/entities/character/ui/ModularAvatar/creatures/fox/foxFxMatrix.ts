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

const DEFAULT_PARTICLES: ParticleConfig = {
  count: 0,
  radius: 80,
  jitter: 0.85,
  targetShape: "none",
  decayRate: 0.0,
};

export const FOX_FX_MATRIX: Record<number, TierFxConfig> = {
  // L1: клубок — тихий спящий дух
  1: {
    rimGlowOpacity: 0.0,
    rimStrokeWidth: 0,
    particleCount: 0,
    particles: { ...DEFAULT_PARTICLES, count: 0 },
    auraOpacity: 0.0,
    auraRadius: 0,
    filterStyle: "none",
  },

  // Силуэт 2: юный лис (L3 — базовый, L5 — пробуждённый)
  3: {
    rimGlowOpacity: 0.2,
    rimStrokeWidth: 1.2,
    particleCount: 0,
    particles: { count: 0, radius: 70, jitter: 0.9, targetShape: "none", decayRate: 0.0 },
    auraOpacity: 0.0,
    auraRadius: 30,
    filterStyle: "none",
  },
  5: {
    rimGlowOpacity: 0.85,
    rimStrokeWidth: 2.8,
    particleCount: 4,
    particles: { count: 4, radius: 80, jitter: 0.85, targetShape: "circle", decayRate: 0.02 },
    auraOpacity: 0.35,
    auraRadius: 55,
    filterStyle: "contrast(1.08) brightness(1.05)",
  },

  // Силуэт 3: взрослый лис (L10 — матерый, L20 — заряженная сигнатурная форма)
  10: {
    rimGlowOpacity: 0.35,
    rimStrokeWidth: 1.6,
    particleCount: 2,
    particles: { count: 2, radius: 75, jitter: 0.8, targetShape: "circle", decayRate: 0.03 },
    auraOpacity: 0.15,
    auraRadius: 40,
    filterStyle: "none",
  },
  20: {
    rimGlowOpacity: 1.0,
    rimStrokeWidth: 3.5,
    particleCount: 8,
    particles: { count: 8, radius: 88, jitter: 0.7, targetShape: "circle", decayRate: 0.03 },
    auraOpacity: 0.6,
    auraRadius: 75,
    filterStyle: "contrast(1.12) brightness(1.08)",
  },

  // Силуэты 4 и 5: Кицунэ
  35: {
    rimGlowOpacity: 0.75,
    rimStrokeWidth: 2.6,
    particleCount: 6,
    particles: { count: 6, radius: 82, jitter: 0.6, targetShape: "circle", decayRate: 0.04 },
    auraOpacity: 0.5,
    auraRadius: 65,
    filterStyle: "none",
  },
  50: {
    rimGlowOpacity: 1.0,
    rimStrokeWidth: 4.2,
    particleCount: 12,
    particles: { count: 12, radius: 95, jitter: 0.5, targetShape: "circle", decayRate: 0.05 },
    auraOpacity: 0.85,
    auraRadius: 90,
    filterStyle: "contrast(1.15) brightness(1.10)",
  },
};

// Extract named configs for type-safe access (avoids Record[number] = undefined issue)
const FX_L1 = FOX_FX_MATRIX[1];
const FX_L3 = FOX_FX_MATRIX[3];
const FX_L5 = FOX_FX_MATRIX[5];
const FX_L10 = FOX_FX_MATRIX[10];
const FX_L20 = FOX_FX_MATRIX[20];
const FX_L35 = FOX_FX_MATRIX[35];
const FX_L50 = FOX_FX_MATRIX[50];

if (!FX_L1 || !FX_L3 || !FX_L5 || !FX_L10 || !FX_L20 || !FX_L35 || !FX_L50) {
  throw new Error("FOX_FX_MATRIX: missing required tier entries");
}

export const getFoxFxConfig = (level: number): TierFxConfig => {
  if (level >= 50) return FX_L50;
  if (level >= 35) return FX_L35;
  if (level >= 20) return FX_L20;
  if (level >= 10) return FX_L10;
  if (level >= 5) return FX_L5;
  if (level >= 3) return FX_L3;
  return FX_L1;
};
