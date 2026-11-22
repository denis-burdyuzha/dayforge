/**
 * skillPresentation — how a skill is shown: rank title, icon, colour, and which skill becomes the title
 * under the avatar. Pure functions (tested in skillPresentation.test.ts).
 */

import {
  BookOpen,
  Car,
  Clapperboard,
  Code2,
  Dumbbell,
  Flower2,
  Footprints,
  Languages,
  type LucideIcon,
  Music,
  Palette,
  TrendingUp,
} from "lucide-react";

import { ATTRIBUTE_COLORS, isAttributeKey, NEUTRAL_GLOW_COLOR } from "./aspect";
import type { CharacterSkillWithStats } from "./characterSkillTypes";
import type { CharacterAttribute } from "./characterTypes";
import type { AttributeKey } from "./types";

// ── Rank ──

export type SkillRank = "Новичок" | "Ученик" | "Подмастерье" | "Мастер" | "Грандмастер";

/** 1–2 Новичок · 3–5 Ученик · 6–9 Подмастерье · 10–14 Мастер · 15+ Грандмастер */
export function getSkillRank(level: number): SkillRank {
  if (level >= 15) return "Грандмастер";
  if (level >= 10) return "Мастер";
  if (level >= 6) return "Подмастерье";
  if (level >= 3) return "Ученик";
  return "Новичок";
}

// ── Icon ──

export type SkillIconCategory =
  | "code"
  | "fitness"
  | "running"
  | "reading"
  | "language"
  | "driving"
  | "design"
  | "video"
  | "music"
  | "marketing"
  | "meditation";

/**
 * Keyword table (lowercase). Cyrillic stems match anywhere in the name; short Latin keys match only at
 * the start of a word (so "art" does not hit "start", "run" does not hit "brunch"). First match wins;
 * running is checked before the generic fitness group.
 */
const ICON_KEYWORDS: Array<{ category: SkillIconCategory; ru: string[]; en: string[] }> = [
  { category: "code", ru: ["код", "программ", "разработ"], en: ["code", "coding", "dev"] },
  { category: "running", ru: ["бег"], en: ["run"] },
  {
    category: "fitness",
    ru: ["спорт", "фитнес", "зал", "трениров"],
    en: ["gym", "fitness", "sport"],
  },
  { category: "reading", ru: ["чтен", "книг"], en: ["read"] },
  { category: "language", ru: ["англ", "язык"], en: ["english", "language"] },
  { category: "driving", ru: ["вожден", "авто"], en: ["drive", "driving"] },
  { category: "design", ru: ["дизайн", "рисов"], en: ["design", "art"] },
  { category: "video", ru: ["монтаж", "видео"], en: ["video"] },
  { category: "music", ru: ["музык", "гитар"], en: ["music"] },
  { category: "marketing", ru: ["маркет"], en: ["seo", "marketing"] },
  { category: "meditation", ru: ["медитац"], en: ["meditat"] },
];

export function detectSkillIconCategory(skillName: string): SkillIconCategory | null {
  const name = skillName.toLowerCase();
  for (const { category, ru, en } of ICON_KEYWORDS) {
    if (ru.some((k) => name.includes(k))) return category;
    if (en.some((k) => new RegExp(`(^|[^a-z])${k}`).test(name))) return category;
  }
  return null;
}

/** Lucide icon per keyword category (rendered with stroke-width 2 in the main attribute colour) */
export const SKILL_ICON_COMPONENTS: Record<SkillIconCategory, LucideIcon> = {
  code: Code2,
  fitness: Dumbbell,
  running: Footprints,
  reading: BookOpen,
  language: Languages,
  driving: Car,
  design: Palette,
  video: Clapperboard,
  music: Music,
  marketing: TrendingUp,
  meditation: Flower2,
};

export type SkillIcon =
  | { kind: "icon"; category: SkillIconCategory; Icon: LucideIcon; color: string }
  | { kind: "rune"; attribute: AttributeKey | null; category: null; color: string };

export function getSkillColor(primaryAttribute: AttributeKey | null): string {
  return primaryAttribute ? ATTRIBUTE_COLORS[primaryAttribute] : NEUTRAL_GLOW_COLOR;
}

/** Keyword match → lucide icon; no match → rune glyph of the main attribute (neutral dot without one) */
export function getSkillIcon(skillName: string, primaryAttribute: AttributeKey | null): SkillIcon {
  const category = detectSkillIconCategory(skillName);
  const color = getSkillColor(primaryAttribute);
  if (category) return { kind: "icon", category, Icon: SKILL_ICON_COMPONENTS[category], color };
  return { kind: "rune", attribute: primaryAttribute, category: null, color };
}

// ── View model ──

export interface SkillView {
  id: string;
  /** display name (first letter capitalised; stored lowercase in the DB) */
  name: string;
  level: number;
  rank: SkillRank;
  totalXp: number;
  lastPracticedAt: string | null;
  /** 0..100 */
  form: number;
  primaryAttribute: AttributeKey | null;
  /** attributes the skill is tied to (primary first), for the small runes on the card */
  attributes: AttributeKey[];
}

export function displaySkillName(name: string): string {
  const t = name.trim();
  return t ? t[0]!.toUpperCase() + t.slice(1) : t;
}

/** CharacterSkillWithStats + attribute definitions (id → code) → SkillView */
export function toSkillView(
  skill: CharacterSkillWithStats,
  attributes: ReadonlyArray<Pick<CharacterAttribute, "attributeId" | "code">>,
): SkillView {
  const codeOf = (id: string | null | undefined): AttributeKey | null => {
    if (!id) return null;
    const code = attributes.find((a) => a.attributeId === id)?.code;
    return code && isAttributeKey(code) ? code : null;
  };
  const primary = codeOf(skill.primaryAttributeId);
  const secondary = codeOf(skill.secondaryAttributeId);
  return {
    id: skill.id,
    name: displaySkillName(skill.name),
    level: skill.level,
    rank: getSkillRank(skill.level),
    totalXp: skill.totalXp,
    lastPracticedAt: skill.lastPracticedAt,
    form: skill.formPercentage,
    primaryAttribute: primary,
    attributes: [primary, secondary].filter(
      (a, i, arr): a is AttributeKey => a !== null && arr.indexOf(a) === i,
    ),
  };
}

/**
 * Title skill: highest level; tie → larger total XP; tie → most recent last practice (never practiced
 * loses). null when there are no skills.
 */
export function pickTitleSkill<T extends Pick<SkillView, "level" | "totalXp" | "lastPracticedAt">>(
  skills: ReadonlyArray<T>,
): T | null {
  const time = (s: T) => (s.lastPracticedAt ? new Date(s.lastPracticedAt).getTime() : -Infinity);
  let best: T | null = null;
  for (const s of skills) {
    if (
      !best ||
      s.level > best.level ||
      (s.level === best.level && s.totalXp > best.totalXp) ||
      (s.level === best.level && s.totalXp === best.totalXp && time(s) > time(best))
    ) {
      best = s;
    }
  }
  return best;
}
