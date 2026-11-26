/**
 * avatarEngine.ts — computes the avatar parameters from the character state.
 *
 * Translates level, class and attributes into the AvatarParams contract consumed by the creature
 * renderers: evolution tier, identity (seed key), raw attribute values and the aspect.
 */

import { resolveAvatarAspect } from "./aspect";
import { createAvatarIdentity } from "./avatarIdentity";
import type { AvatarEvolutionStage, AvatarParams } from "./avatarTypes";
import type { Character, CharacterAttribute } from "./characterTypes";

// ── Milestone Level Tiers ───────────────────────────────────────────────────────

export const EVOLUTION_TIER_THRESHOLDS = {
  TIER_1_SPARK: 1, // Levels 1–2
  TIER_2_HATCHLING: 3, // Levels 3–4
  TIER_3_YOUNG: 5, // Levels 5–9
  TIER_4_AWAKENED: 10, // Levels 10–19
  TIER_5_SIGNATURE: 20, // Levels 20–34
  TIER_6_ASCENDED: 35, // Levels 35–49
  TIER_7_MYTHIC: 50, // Levels 50+
} as const;

export function getEvolutionTier(level: number): AvatarEvolutionStage["tier"] {
  if (level >= EVOLUTION_TIER_THRESHOLDS.TIER_7_MYTHIC) return 7;
  if (level >= EVOLUTION_TIER_THRESHOLDS.TIER_6_ASCENDED) return 6;
  if (level >= EVOLUTION_TIER_THRESHOLDS.TIER_5_SIGNATURE) return 5;
  if (level >= EVOLUTION_TIER_THRESHOLDS.TIER_4_AWAKENED) return 4;
  if (level >= EVOLUTION_TIER_THRESHOLDS.TIER_3_YOUNG) return 3;
  if (level >= EVOLUTION_TIER_THRESHOLDS.TIER_2_HATCHLING) return 2;
  return 1;
}

const CLASS_IDS: ReadonlyArray<AvatarEvolutionStage["classArchetype"]> = [
  "warrior",
  "creator",
  "explorer",
  "strategist",
  "wanderer",
];

/**
 * `_skills` and `_todayState` are accepted for the existing call sites but no longer used: they only fed the
 * removed organic renderer (skill imprints, mood).
 */
export function computeAvatarParams(
  character: Character,
  attributes: ReadonlyArray<Pick<CharacterAttribute, "code" | "value">>,
  _skills?: unknown,
  _todayState?: unknown,
): AvatarParams {
  const classArchetype = CLASS_IDS.find((c) => c === character.class) ?? "warrior";
  const value = (code: string) => attributes.find((a) => a.code === code)?.value ?? 1;

  const attributeValues: AvatarParams["attributeValues"] = {
    strength: value("strength"),
    endurance: value("endurance"),
    discipline: value("discipline"),
    intelligence: value("intelligence"),
    focus: value("focus"),
    social: value("social"),
    creativity: value("creativity"),
  };

  return {
    identity: createAvatarIdentity(character.id),
    evolution: {
      tier: getEvolutionTier(character.level),
      level: character.level,
      classArchetype,
    },
    attributeValues,
    // the dominant attribute (≥ 3) colours rim light, aura and the aspect accent of every creature
    aspect: resolveAvatarAspect(attributeValues),
  };
}
