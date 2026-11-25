/**
 * Event schema of parse-day-report: the JSON Schema handed to the model (strict tool use) and the Zod schema
 * the server validates the model output with. Numeric/length limits are not expressible in a strict tool
 * schema, so Zod + sanitizeEvents enforce them.
 */
import { z } from "zod";

import skillIcons from "../_shared/skillIcons.json" with { type: "json" };

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

export interface SkillIconDef {
  key: string;
  label: string;
  lucide: string;
}
export const SKILL_ICONS: readonly SkillIconDef[] = skillIcons;
export const SKILL_ICON_KEYS: readonly string[] = SKILL_ICONS.map((i) => i.key);
export const FALLBACK_ICON = "misc";

export const LIMITS = {
  textMin: 3,
  textMax: 4000,
  hoursMin: 0.1,
  hoursMax: 8,
  parsesPerDay: 20,
  timeoutMs: 20_000,
  maxEvents: 30,
} as const;

// ── Request ──

export const ParseRequestSchema = z.object({
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  text: z.string(),
});
export type ParseRequest = z.infer<typeof ParseRequestSchema>;

// ── Model output (validated) ──

const SkillRefSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("existing"), skillId: z.string().min(1) }),
  z.object({
    kind: z.literal("new"),
    name: z.string().trim().min(1).max(60),
    attributes: z.array(z.enum(ATTRIBUTE_CODES)).min(1),
    icon: z.string(),
  }),
  z.object({ kind: z.literal("none") }),
]);

export const ModelEventSchema = z.object({
  description: z.string().trim().min(1),
  hours: z.number().finite(),
  plannedQuestId: z.string().nullable(),
  skill: SkillRefSchema,
  confidence: z.enum(["high", "low"]),
  note: z.string().nullable(),
});

export const ModelOutputSchema = z.object({
  events: z.array(ModelEventSchema).max(LIMITS.maxEvents),
});
export type ModelOutput = z.infer<typeof ModelOutputSchema>;

// ── Response event (after sanitizeEvents) ──

export type SkillRef =
  | { kind: "existing"; skillId: string }
  | { kind: "new"; name: string; attributes: AttributeCode[]; icon: string }
  | { kind: "none" };

export interface DayEvent {
  description: string;
  hours: number;
  plannedQuestId: string | null;
  skill: SkillRef;
  confidence: "high" | "low";
  note: string | null;
}

// ── JSON Schema for the tool (strict: true) ──

const nullableString = { anyOf: [{ type: "string" }, { type: "null" }] };

export const SUBMIT_TOOL_NAME = "submit_day_events";

export const SUBMIT_TOOL_INPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["events"],
  properties: {
    events: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["description", "hours", "plannedQuestId", "skill", "confidence", "note"],
        properties: {
          description: { type: "string", description: "Коротко, как пользователь это сделал" },
          hours: { type: "number", description: "Длительность в часах, 0.1–8, шаг 0.1" },
          plannedQuestId: {
            ...nullableString,
            description: "id запланированного квеста, если событие — он; иначе null",
          },
          skill: {
            anyOf: [
              {
                type: "object",
                additionalProperties: false,
                required: ["kind", "skillId"],
                properties: {
                  kind: { type: "string", enum: ["existing"] },
                  skillId: { type: "string", description: "id существующего навыка из контекста" },
                },
              },
              {
                type: "object",
                additionalProperties: false,
                required: ["kind", "name", "attributes", "icon"],
                properties: {
                  kind: { type: "string", enum: ["new"] },
                  name: {
                    type: "string",
                    description: "Существительное, им. падеж, с большой буквы",
                  },
                  attributes: {
                    type: "array",
                    items: { type: "string", enum: [...ATTRIBUTE_CODES] },
                    description: "1 атрибут; 2 — только если навык явно развивает оба",
                  },
                  icon: { type: "string", enum: [...SKILL_ICON_KEYS] },
                },
              },
              {
                type: "object",
                additionalProperties: false,
                required: ["kind"],
                properties: { kind: { type: "string", enum: ["none"] } },
              },
            ],
          },
          confidence: { type: "string", enum: ["high", "low"] },
          note: { ...nullableString, description: "Для low: что неясно; иначе null" },
        },
      },
    },
  },
} as const;
