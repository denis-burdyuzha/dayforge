/**
 * Event schema of parse-day-report: the JSON Schema handed to the model (strict tool use) and the Zod schema
 * the server validates the model output with. Numeric/length limits are not expressible in a strict tool
 * schema, so Zod + sanitizeEvents enforce them.
 */
import { z } from "zod";

import { nullableString, SKILL_REF_JSON_SCHEMA, SkillRefSchema } from "../_shared/ai/schemas.ts";
import type { SkillRef } from "../_shared/ai/skills.ts";

// catalogs live in the shared AI module; re-exported for the fixtures, tests and eval
export {
  ATTRIBUTE_CODES,
  ATTRIBUTE_LABELS_RU,
  type AttributeCode,
  FALLBACK_ICON,
  SKILL_ICON_KEYS,
  SKILL_ICONS,
  type SkillIconDef,
} from "../_shared/ai/catalog.ts";
export type { SkillRef } from "../_shared/ai/skills.ts";

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

export interface DayEvent {
  description: string;
  hours: number;
  plannedQuestId: string | null;
  skill: SkillRef;
  confidence: "high" | "low";
  note: string | null;
}

// ── JSON Schema for the tool (strict: true) ──

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
          skill: SKILL_REF_JSON_SCHEMA,
          confidence: { type: "string", enum: ["high", "low"] },
          note: { ...nullableString, description: "Для low: что неясно; иначе null" },
        },
      },
    },
  },
} as const;
