import { useQuery } from "@tanstack/react-query";

import { useUserToday } from "@/entities/profile/model/useProfile";

import { characterRepository } from "../api/characterRepository";
import type { CharacterSkill } from "../model/characterSkillTypes";
import { enrichSkillWithStats } from "../model/characterSkillTypes";
import type { CharacterAttribute, DailyState, XpEvent } from "./characterTypes";
import { useCharacter } from "./useCharacter";

/**
 * Aggregates all character-related data needed by the Character/Home page.
 * Each sub-query is keyed under ['character', characterId, ...] so they are
 * individually cached and refetchable without disturbing each other.
 */
export function useCharacterData(userId: string | undefined) {
  const characterQuery = useCharacter(userId);
  const characterId = characterQuery.data?.id;
  const { today, dayStartTime, ready: dayReady } = useUserToday(userId);

  const attributesQuery = useQuery<CharacterAttribute[]>({
    queryKey: ["character", characterId, "attributes"],
    queryFn: () => characterRepository.getCharacterAttributes(characterId!),
    enabled: Boolean(characterId),
    staleTime: 30_000,
  });

  const stateQuery = useQuery<DailyState | null>({
    queryKey: ["character", characterId, "state", today],
    queryFn: () => characterRepository.getDayState(characterId!, today),
    enabled: Boolean(characterId) && dayReady,
    staleTime: 30_000,
  });

  /**
   * XP transactions — surfaced in "Recent Events" / "Today's Growth" sections.
   */
  const xpEventsQuery = useQuery<XpEvent[]>({
    queryKey: ["character", characterId, "xp-events"],
    queryFn: () => characterRepository.getRecentXpEvents(characterId!, 20),
    enabled: Boolean(characterId),
    staleTime: 30_000,
  });

  /**
   * User-defined skills from character_skills table.
   * Enriched with computed level, formPercentage, formMultiplier.
   */
  const characterSkillsQuery = useQuery<CharacterSkill[]>({
    queryKey: ["character", characterId, "character-skills"],
    queryFn: () => characterRepository.getCharacterSkills(characterId!),
    enabled: Boolean(characterId),
    staleTime: 30_000,
  });

  const isLoading =
    characterQuery.isLoading ||
    (Boolean(characterId) &&
      (attributesQuery.isLoading ||
        stateQuery.isLoading ||
        xpEventsQuery.isLoading ||
        characterSkillsQuery.isLoading));

  const error =
    characterQuery.error ??
    attributesQuery.error ??
    stateQuery.error ??
    xpEventsQuery.error ??
    characterSkillsQuery.error;

  return {
    character: characterQuery.data ?? null,
    attributes: attributesQuery.data ?? [],
    todayState: stateQuery.data ?? null,
    xpEvents: xpEventsQuery.data ?? [],
    /** User-defined skills with computed level + form stats */
    characterSkills: (characterSkillsQuery.data ?? []).map(enrichSkillWithStats),
    /** the user's day (by the profile's day boundary) */
    today,
    dayStartTime,
    isLoading,
    error,
  };
}
