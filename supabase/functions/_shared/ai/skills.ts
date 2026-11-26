/**
 * Skill references in model output: the shape both parsers return, the user's skills handed to the model,
 * and the server-side check of what the model picked (the same rules for the report and the plan).
 */
import { type AttributeCode, FALLBACK_ICON, SKILL_ICON_KEYS } from "./catalog.ts";

export interface SkillContext {
  id: string;
  name: string;
  aliases: string[];
  attributes: AttributeCode[];
}

export type SkillRef =
  | { kind: "existing"; skillId: string }
  | { kind: "new"; name: string; attributes: AttributeCode[]; icon: string }
  | { kind: "none" };

/** Same rule as SQL _normalize_skill_name: trim, collapse whitespace, lower case */
export const normalizeSkillName = (name: string): string =>
  name.trim().replace(/\s+/g, " ").toLowerCase();

export const capitalize = (s: string): string => (s ? s[0]!.toUpperCase() + s.slice(1) : s);

export interface ResolvedSkill {
  skill: SkillRef;
  /** set when the user has to review the skill (confidence → low) */
  reviewNote: string | null;
}

/**
 * - existing with an id the user does not have → a new skill named after `fallbackName`, no attributes,
 *   to be reviewed (never fail on a foreign / made-up id);
 * - new whose name matches an existing skill or alias → that skill;
 * - new: ≤ 2 distinct attributes, an icon from the list (else "misc").
 */
export function resolveSkillRef(
  skill: SkillRef,
  skills: readonly SkillContext[],
  fallbackName: string,
): ResolvedSkill {
  if (skill.kind === "existing") {
    if (skills.some((s) => s.id === skill.skillId)) {
      return { skill: { kind: "existing", skillId: skill.skillId }, reviewNote: null };
    }
    return {
      skill: {
        kind: "new",
        name: capitalize(fallbackName.trim().slice(0, 40)),
        attributes: [],
        icon: FALLBACK_ICON,
      },
      reviewNote: "навык не найден — проверь название и атрибуты",
    };
  }
  if (skill.kind === "new") {
    const name = capitalize(skill.name.trim().replace(/\s+/g, " "));
    const key = normalizeSkillName(name);
    const match = skills.find((s) =>
      [s.name, ...s.aliases].some((n) => normalizeSkillName(n) === key),
    );
    if (match) return { skill: { kind: "existing", skillId: match.id }, reviewNote: null };
    const attributes = [...new Set(skill.attributes)].slice(0, 2);
    const icon = SKILL_ICON_KEYS.includes(skill.icon) ? skill.icon : FALLBACK_ICON;
    return { skill: { kind: "new", name, attributes, icon }, reviewNote: null };
  }
  return { skill: { kind: "none" }, reviewNote: null };
}
