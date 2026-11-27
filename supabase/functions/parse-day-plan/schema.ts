/**
 * Item schema of parse-day-plan: the strict JSON Schema of the tool and the Zod schema the server validates the
 * model output with. Ranges (5–480 minutes, multiples of 5, HH:MM) are enforced by Zod + sanitizeItems.
 */
import { z } from "zod";

import { nullableString, SKILL_REF_JSON_SCHEMA, SkillRefSchema } from "../_shared/ai/schemas.ts";
import type { SkillRef } from "../_shared/ai/skills.ts";

export const LIMITS = {
  textMin: 3,
  textMax: 4000,
  durationMin: 5,
  durationMax: 480,
  durationStep: 5,
  parsesPerDay: 10,
  timeoutMs: 20_000,
  maxItems: 30,
  /** window for items whose time the model infers */
  dayStart: "07:00",
  dayEnd: "23:00",
} as const;

export const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

// ── Request ──

export const ParseRequestSchema = z.object({
  planDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  text: z.string(),
  /** client's local time "HH:MM" */
  nowLocal: z.string().regex(HHMM),
  /** IANA time zone of the client, e.g. "Europe/Moscow" */
  timezone: z.string().min(1).max(64),
  /** the user's day boundary "HH:MM" (00:00–06:00); before it the night belongs to the previous date */
  dayStartTime: z
    .string()
    .regex(/^0[0-6]:[03]0$/)
    .refine((t) => t <= "06:00")
    .default("04:00"),
});
export type ParseRequest = z.infer<typeof ParseRequestSchema>;

// ── Model output (validated) ──

export const ModelItemSchema = z.object({
  title: z.string().trim().min(1),
  startTime: z.string().nullable(),
  durationMinutes: z.number().finite(),
  skill: SkillRefSchema,
  duplicateOfExisting: z.boolean(),
  confidence: z.enum(["high", "low"]),
  note: z.string().nullable(),
});

export const ModelOutputSchema = z.object({
  items: z.array(ModelItemSchema).max(LIMITS.maxItems),
});
export type ModelOutput = z.infer<typeof ModelOutputSchema>;

// ── Response item (after sanitizeItems) ──

export interface PlanItem {
  title: string;
  /** "HH:MM" or null when the time cannot be inferred */
  startTime: string | null;
  durationMinutes: number;
  skill: SkillRef;
  duplicateOfExisting: boolean;
  confidence: "high" | "low";
  note: string | null;
}

// ── JSON Schema for the tool (strict: true) ──

export const SUBMIT_TOOL_NAME = "submit_day_plan";

export const SUBMIT_TOOL_INPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["items"],
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "startTime",
          "durationMinutes",
          "skill",
          "duplicateOfExisting",
          "confidence",
          "note",
        ],
        properties: {
          title: { type: "string", description: "Короткое название действия" },
          startTime: {
            ...nullableString,
            description: "Время начала HH:MM; null, если его нельзя определить даже примерно",
          },
          durationMinutes: {
            type: "integer",
            description: "Длительность в минутах, 5–480, кратно 5",
          },
          skill: SKILL_REF_JSON_SCHEMA,
          duplicateOfExisting: {
            type: "boolean",
            description: "true, если пункт повторяет уже существующий квест на эту дату",
          },
          confidence: { type: "string", enum: ["high", "low"] },
          note: { ...nullableString, description: "Для low: что оценено или неясно; иначе null" },
        },
      },
    },
  },
} as const;
