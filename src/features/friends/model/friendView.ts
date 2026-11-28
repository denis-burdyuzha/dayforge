import { isAttributeKey } from "@/entities/character/model/aspect";
import { computeAvatarParams } from "@/entities/character/model/avatarEngine";
import type { Character } from "@/entities/character/model/characterTypes";
import { getSkillRank, type SkillView } from "@/entities/character/model/skillPresentation";

import type { DaySummary, FriendCard } from "./friendTypes";

/** Avatar params of a friend: the same engine as the own avatar, from the fields the server shares */
export function friendAvatarParams(card: FriendCard) {
  const character: Character = {
    id: card.userId,
    profileId: card.userId,
    name: card.name,
    class: card.classId,
    level: card.level,
    totalXp: 0,
    createdAt: "",
  };
  const attributes = Object.entries(card.attributes).map(([code, value]) => ({ code, value }));
  return computeAvatarParams(character, attributes);
}

/**
 * The friend's title skill as a SkillView for SkillTitlePlate. The server shares no practice dates, so the form
 * ring is shown full.
 */
export function friendTitleSkill(card: FriendCard): SkillView | null {
  const t = card.titleSkill;
  if (!t) return null;
  const primary =
    t.primaryAttribute && isAttributeKey(t.primaryAttribute) ? t.primaryAttribute : null;
  const name = t.name.trim();
  return {
    id: `${card.userId}:title`,
    name: name ? name[0]!.toUpperCase() + name.slice(1) : name,
    level: t.level,
    rank: getSkillRank(t.level),
    totalXp: 0,
    lastPracticedAt: null,
    form: 100,
    primaryAttribute: primary,
    attributes: primary ? [primary] : [],
    iconKey: t.icon,
  };
}

const hoursFormat = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

function cap(s: string): string {
  return s ? s[0]!.toUpperCase() + s.slice(1) : s;
}

/**
 * One line about a friend's day: «План 4/5 · 3,5 ч · Английский, Зал»; nothing yet → «Сегодня пока ничего»
 * (`emptyText` for past days); hidden → «Скрыто».
 */
export function summaryLine(summary: DaySummary | null, emptyText = "Сегодня пока ничего"): string {
  if (!summary) return "Скрыто";
  if (summary.plannedCount === 0 && summary.completedCount === 0) return emptyText;
  const parts = [`План ${summary.completedCount}/${summary.plannedCount}`];
  if (summary.completedHours > 0) parts.push(`${hoursFormat.format(summary.completedHours)} ч`);
  if (summary.skills.length > 0) parts.push(summary.skills.map(cap).join(", "));
  return parts.join(" · ");
}
