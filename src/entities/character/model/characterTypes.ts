import type { CharacterClassId } from "./types";

export interface Character {
  id: string;
  profileId: string;
  name: string;
  class: CharacterClassId | null;
  level: number;
  totalXp: number;
  /** ISO timestamp — when the character was created (= the start of the user's journey) */
  createdAt: string;
}

/**
 * A single XP transaction row, joined with its optional report event.
 * Returned by characterRepository.getRecentXpEvents().
 */
export interface XpEvent {
  id: string;
  amount: number;
  reason: string | null;
  /** ISO timestamp of the transaction */
  createdAt: string;
  /** report_events.type — e.g. 'achievement', 'habit', etc. May be null if no event linked */
  eventType: string | null;
  /** report_events.description — may be null */
  eventDescription: string | null;
}

export interface CharacterAttribute {
  id: string;
  attributeId: string;
  code: string;
  name: string;
  description?: string;
  value: number;
}

export interface DailyState {
  id: string;
  date: string;
  energy: number;
  mood: number;
  fatigue: number;
  focus: number;
}

/**
 * Base multiplier for level progression economy.
 * Formula: threshold(level) = BASE_XP_MULTIPLIER * level * (level - 1)
 */
export const BASE_XP_MULTIPLIER = 10;

/**
 * XP required to advance from level `n` to level `n+1`.
 * Formula: 20 * n
 */
export function xpRequiredForLevel(level: number): number {
  return 2 * BASE_XP_MULTIPLIER * level;
}

/**
 * Total XP accumulated at the *start* of level `n` (i.e. the XP threshold
 * to reach level `n`).
 * Formula: 10 * n * (n - 1)
 */
export function xpThresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  return BASE_XP_MULTIPLIER * level * (level - 1);
}

/**
 * XP earned within the current level (i.e. progress bar value).
 */
export function xpWithinCurrentLevel(totalXp: number, level: number): number {
  return Math.max(0, totalXp - xpThresholdForLevel(level));
}
