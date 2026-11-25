/**
 * Types and pure functions for the new character_skills system.
 *
 * Design:
 * - Skill level and form are NOT stored separately — computed from total_xp
 *   and last_practiced_at on the fly, avoiding stale state.
 * - No cron/scheduler needed: form decays deterministically from timestamp.
 */

// ── Balance constants (keep in sync with RPC) ────────────────────────────────

/** Base multiplier for skill level threshold.
 *  Formula: threshold(level) = SKILL_BASE_XP_MULTIPLIER * level * (level - 1)
 *  level 1 = 0 XP, level 2 = 20 XP, level 3 = 60 XP, level 4 = 120 XP */
export const SKILL_BASE_XP_MULTIPLIER = 10;

/** Days after last practice where form stays at 100% */
export const SKILL_FORM_GRACE_DAYS = 3;

/** Percent of form lost per day after grace period */
export const SKILL_FORM_DECAY_PER_DAY = 5;

/** Minimum form — never reaches 0 to preserve past level value */
export const SKILL_FORM_MIN = 20;

// ── Core type ────────────────────────────────────────────────────────────────

export interface CharacterSkill {
  id: string;
  characterId: string;
  /** Stored lowercase (canonical form) */
  name: string;
  totalHours: number;
  totalXp: number;
  /** null = never practiced */
  lastPracticedAt: string | null;
  createdAt: string;
  /** attribute_definitions.id of the main / second attribute the skill is tied to (null = none) */
  primaryAttributeId?: string | null;
  secondaryAttributeId?: string | null;
  /** alternative names used to match the skill (AI day report) */
  aliases?: string[];
  /** icon key from shared/config/skillIcons (null → keyword-based icon) */
  icon?: string | null;
}

/** CharacterSkill with computed display fields (level, form) */
export interface CharacterSkillWithStats extends CharacterSkill {
  level: number;
  formPercentage: number;
  formMultiplier: number;
}

// ── Computed functions ───────────────────────────────────────────────────────

/**
 * Total XP required to REACH level `n` (i.e. the level gate threshold).
 * Formula: SKILL_BASE_XP_MULTIPLIER * n * (n - 1)
 */
export function skillXpThresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  return SKILL_BASE_XP_MULTIPLIER * level * (level - 1);
}

/**
 * XP required to advance from level `n` to `n+1`.
 * Formula: 2 * SKILL_BASE_XP_MULTIPLIER * n
 */
export function skillXpRequiredForLevel(level: number): number {
  return 2 * SKILL_BASE_XP_MULTIPLIER * level;
}

/**
 * Compute skill level from total XP accumulated.
 * Mirrors the LOOP logic in the complete_quest RPC.
 */
export function computeSkillLevel(totalXp: number): number {
  let level = 1;
  let lvl = 2;
  while (true) {
    const threshold = SKILL_BASE_XP_MULTIPLIER * lvl * (lvl - 1);
    if (threshold <= totalXp) {
      level = lvl;
      lvl++;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Compute form percentage (0–100) from last_practiced_at.
 *
 * - null → 100% (never practiced = fresh start)
 * - within grace period → 100%
 * - after grace: MAX(SKILL_FORM_MIN, 100 - (days - grace) * SKILL_FORM_DECAY_PER_DAY)
 */
export function computeFormPercentage(lastPracticedAt: string | null): number {
  if (lastPracticedAt === null) return 100;

  const now = Date.now();
  const last = new Date(lastPracticedAt).getTime();
  const daysSince = Math.floor((now - last) / (1000 * 60 * 60 * 24));

  if (daysSince <= SKILL_FORM_GRACE_DAYS) return 100;

  return Math.max(
    SKILL_FORM_MIN,
    100 - (daysSince - SKILL_FORM_GRACE_DAYS) * SKILL_FORM_DECAY_PER_DAY,
  );
}

/**
 * Resolve form multiplier tier from form percentage.
 * Used for skill XP calculation during quest completion.
 *
 * form >= 90 → 1.0 | >= 70 → 0.9 | >= 40 → 0.75 | < 40 → 0.5
 */
export function computeFormMultiplier(formPercentage: number): number {
  if (formPercentage >= 90) return 1.0;
  if (formPercentage >= 70) return 0.9;
  if (formPercentage >= 40) return 0.75;
  return 0.5;
}

/**
 * Human-readable "last practiced" label for display.
 * Returns: "сегодня" | "N дн. назад" | "никогда"
 */
export function formatLastPracticed(lastPracticedAt: string | null): string {
  if (lastPracticedAt === null) return "никогда";

  const now = Date.now();
  const last = new Date(lastPracticedAt).getTime();
  const days = Math.floor((now - last) / (1000 * 60 * 60 * 24));

  if (days === 0) return "сегодня";
  if (days === 1) return "вчера";
  return `${days} дн. назад`;
}

/**
 * Enrich a raw CharacterSkill with computed stats.
 */
export function enrichSkillWithStats(skill: CharacterSkill): CharacterSkillWithStats {
  const level = computeSkillLevel(skill.totalXp);
  const formPercentage = computeFormPercentage(skill.lastPracticedAt);
  const formMultiplier = computeFormMultiplier(formPercentage);
  return { ...skill, level, formPercentage, formMultiplier };
}
