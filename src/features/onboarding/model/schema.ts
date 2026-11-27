import { z } from "zod";

import { characterNameSchema } from "@/entities/character/model/characterName";

export const onboardingSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(30, "Имя слишком длинное"),

  // the same rules as rename_character / complete_onboarding on the server
  characterName: characterNameSchema,

  classId: z.enum(["warrior", "creator", "explorer", "strategist", "wanderer"], {
    message: "Выбери класс",
  }),

  startingDirections: z
    .array(
      z.enum(["programming", "fitness", "learning", "career", "finance", "social", "creativity"]),
    )
    .min(1, "Выбери хотя бы одно направление")
    .max(5, "Можно выбрать максимум 5 направлений"),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export const stepFields = {
  identity: ["username"] as const,
  character: ["characterName", "classId"] as const,
  directions: ["startingDirections"] as const,
};
