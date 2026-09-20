/**
 * avatarParams.ts — Parametric avatar model for CharacterSigil.
 *
 * Computes display parameters from character data deterministically.
 * No AI, no randomness — pure function of current game state.
 */

import type { CharacterSkillWithStats } from "./characterSkillTypes";
import type { CharacterAttribute } from "./characterTypes";

// ── Balance constants ─────────────────────────────────────────────────────────

/** Discipline value at which posture switches to 'confident' */
export const POSTURE_DISCIPLINE_THRESHOLD = 10;

/** Level thresholds for clothing/sigil decoration tier */
export const CLOTHING_TIER_THRESHOLDS = {
  tier2: 5, // levels 5–9
  tier3: 10, // levels 10+
} as const;

// ── Skill icon dictionary ─────────────────────────────────────────────────────

/**
 * Maps keyword patterns (lowercase) → emoji icon.
 * Each entry is checked via String.includes() against the lowercased skill name.
 * First match wins. Fallback: ⭐
 */
const SKILL_ICON_ENTRIES: Array<{ keywords: string[]; icon: string }> = [
  {
    keywords: [
      "program",
      "код",
      "code",
      "dev",
      "frontend",
      "backend",
      "разработ",
      "typescript",
      "javascript",
      "python",
      "rust",
      "swift",
    ],
    icon: "💻",
  },
  {
    keywords: [
      "fitness",
      "workout",
      "спорт",
      "тренировк",
      "gym",
      "бег",
      "running",
      "crossfit",
      "силов",
    ],
    icon: "🏋️",
  },
  {
    keywords: ["seo", "маркетинг", "marketing", "реклам", "smm", "контент", "brand"],
    icon: "📢",
  },
  {
    keywords: ["чтени", "reading", "книг", "book", "литератур"],
    icon: "📚",
  },
  {
    keywords: ["письм", "writing", "блог", "blog", "текст", "copywrite", "journalist"],
    icon: "✍️",
  },
  {
    keywords: ["музык", "music", "guitar", "гитар", "piano", "пианино", "drums", "vocal", "вокал"],
    icon: "🎵",
  },
  {
    keywords: ["рисун", "дизайн", "design", "art", "illustrat", "figma", "sketch", "ui"],
    icon: "🎨",
  },
  {
    keywords: ["english", "spanish", "french", "german", "язык", "language", "lingua"],
    icon: "🌐",
  },
  {
    keywords: ["готовк", "cooking", "кулинар", "chef", "recipe"],
    icon: "🍳",
  },
  {
    keywords: ["медитац", "meditation", "yoga", "йога", "mindful", "breathe"],
    icon: "🧘",
  },
];

/** Fallback icon when no keyword matches */
const SKILL_ICON_FALLBACK = "⭐";

export function getSkillIcon(skillName: string): string {
  const lower = skillName.toLowerCase();
  for (const entry of SKILL_ICON_ENTRIES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.icon;
    }
  }
  return SKILL_ICON_FALLBACK;
}

// ── Output type ───────────────────────────────────────────────────────────────

export interface SkillBadge {
  name: string;
  icon: string;
}

export interface AvatarParams {
  /** Top skill by level, or null if fewer than 1 skills exist */
  topSkill1: SkillBadge | null;
  /** Second-top skill by level, or null if fewer than 2 skills exist */
  topSkill2: SkillBadge | null;
  /** 'confident' when Discipline >= POSTURE_DISCIPLINE_THRESHOLD */
  postureVariant: "confident" | "neutral";
  /** Tier based on character level (affects glow intensity on sigil) */
  clothingTier: 1 | 2 | 3;
  /** Hardcoded for now — no current state data source yet */
  expression: "neutral";
}

// ── Main computation ──────────────────────────────────────────────────────────

export function computeAvatarParams(
  characterLevel: number,
  attributes: CharacterAttribute[],
  skills: CharacterSkillWithStats[],
): AvatarParams {
  // Top 2 skills by level (then by totalXp as tiebreaker)
  const sorted = [...skills].sort((a, b) =>
    b.level !== a.level ? b.level - a.level : b.totalXp - a.totalXp,
  );

  const topSkill1 = sorted[0] ? { name: sorted[0].name, icon: getSkillIcon(sorted[0].name) } : null;

  const topSkill2 = sorted[1] ? { name: sorted[1].name, icon: getSkillIcon(sorted[1].name) } : null;

  // Posture: 'confident' if Discipline attribute >= threshold
  const disciplineAttr = attributes.find((a) => a.code === "discipline");
  const postureVariant: AvatarParams["postureVariant"] =
    (disciplineAttr?.value ?? 0) >= POSTURE_DISCIPLINE_THRESHOLD ? "confident" : "neutral";

  // Clothing tier from character level
  let clothingTier: 1 | 2 | 3 = 1;
  if (characterLevel >= CLOTHING_TIER_THRESHOLDS.tier3) clothingTier = 3;
  else if (characterLevel >= CLOTHING_TIER_THRESHOLDS.tier2) clothingTier = 2;

  return {
    topSkill1,
    topSkill2,
    postureVariant,
    clothingTier,
    expression: "neutral",
  };
}
