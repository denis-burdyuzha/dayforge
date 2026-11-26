/**
 * Schema pieces shared by the parsers: the skill reference (Zod for validation + strict JSON Schema for the
 * tool) and helpers. Numeric/length limits are not expressible in a strict tool schema — Zod and the
 * sanitizers enforce them.
 */
import { z } from "zod";

import { ATTRIBUTE_CODES, SKILL_ICON_KEYS } from "./catalog.ts";

export const SkillRefSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("existing"), skillId: z.string().min(1) }),
  z.object({
    kind: z.literal("new"),
    name: z.string().trim().min(1).max(60),
    attributes: z.array(z.enum(ATTRIBUTE_CODES)).min(1),
    icon: z.string(),
  }),
  z.object({ kind: z.literal("none") }),
]);

export const nullableString = { anyOf: [{ type: "string" }, { type: "null" }] } as const;

export const SKILL_REF_JSON_SCHEMA = {
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
} as const;
