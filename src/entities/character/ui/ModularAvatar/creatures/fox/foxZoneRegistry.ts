import type { FoxTierIndex } from "./foxZones";

/**
 * FOX_ZONES_BY_TIER — Единый документированный реестр анатомических зон SVG-ассетов Fox (L1..L5).
 * Единственный источник правды о существующих зонах для всех систем аватара.
 */
export const FOX_ZONES_BY_TIER: Record<FoxTierIndex, string[]> = {
  1: ["head", "ear_far", "ear_near", "eyes", "snout", "torso", "tail"], // curled pup, no separate limb zones
  2: ["head", "ears", "eyes", "snout", "torso", "tail", "tailTip", "limbsFront", "limbsBack"],
  3: ["head", "ears", "eyes", "snout", "torso", "tail", "limbsFront", "limbsBack"],
  4: ["head", "ears", "eyes", "snout", "torso", "tail", "armLeft", "armRight", "legs"], // L4: armLeft & armRight
  5: ["head", "ears", "eyes", "snout", "torso", "arms", "legs", "tailArray"], // L5: arms & legs & tailArray
};

/**
 * FOX_LIMB_ZONES_BY_TIER — Зоны конечностей (рук/ног) по тирам для эффекта Strength (плечи/лапы).
 */
export const FOX_LIMB_ZONES_BY_TIER: Record<FoxTierIndex, string[]> = {
  1: [],
  2: ["limbsFront", "limbsBack"],
  3: ["limbsFront", "limbsBack"],
  4: ["armLeft", "armRight", "legs"],
  5: ["arms", "legs"],
};

/**
 * FOX_VEIN_ZONES_BY_TIER — Зоны жил Endurance (строго ИСКЛЮЧИТЕЛЬНО НОГИ).
 * Зоны рук (armLeft/armRight на L4, arms на L5) не используются.
 */
export const FOX_VEIN_ZONES_BY_TIER: Record<FoxTierIndex, string[]> = {
  1: [],
  2: ["limbsFront", "limbsBack"],
  3: ["limbsFront", "limbsBack"],
  4: ["legs"],
  5: ["legs"],
};
