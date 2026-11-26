/**
 * WOLF_FX_MATRIX — tier FX of the wolf (Warrior). Same values per tier as FOX_FX_MATRIX (rim glow, particles,
 * aura, colour grading); aspect / neutral colours are the shared ones (model/aspect.ts). The bear, lion and
 * deer use the same values (their matrices spread this one).
 */
import type { TierFxMatrix } from "../../tierFx";

export const WOLF_FX_MATRIX: TierFxMatrix = {
  // L1: свернувшийся детёныш
  1: {
    rimGlowOpacity: 0.0,
    rimStrokeWidth: 0,
    particleCount: 0,
    particles: { count: 0, radius: 80, jitter: 0.85, targetShape: "none", decayRate: 0.0 },
    auraOpacity: 0.0,
    auraRadius: 0,
    filterStyle: "none",
  },

  // Силуэт 2: молодой зверь (L3 — базовый, L5 — пробуждённый)
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

  // Силуэт 3: взрослый (L10 — матёрый, L20 — заряженная сигнатурная форма)
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

  // Силуэты 4 и 5: вознесённый / мифический
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
