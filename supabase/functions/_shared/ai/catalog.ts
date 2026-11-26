/** Static catalogs shared by the AI parsers and the client: the 7 attributes and the skill icon keys. */
import skillIcons from "../skillIcons.json" with { type: "json" };

export const ATTRIBUTE_CODES = [
  "strength",
  "endurance",
  "intelligence",
  "focus",
  "discipline",
  "social",
  "creativity",
] as const;
export type AttributeCode = (typeof ATTRIBUTE_CODES)[number];

export const ATTRIBUTE_LABELS_RU: Record<AttributeCode, string> = {
  strength: "Сила",
  endurance: "Выносливость",
  intelligence: "Интеллект",
  focus: "Фокус",
  discipline: "Дисциплина",
  social: "Социальность",
  creativity: "Креативность",
};

export const isAttributeCode = (code: unknown): code is AttributeCode =>
  typeof code === "string" && (ATTRIBUTE_CODES as readonly string[]).includes(code);

export interface SkillIconDef {
  key: string;
  label: string;
  lucide: string;
}
export const SKILL_ICONS: readonly SkillIconDef[] = skillIcons;
export const SKILL_ICON_KEYS: readonly string[] = SKILL_ICONS.map((i) => i.key);
export const FALLBACK_ICON = "misc";
