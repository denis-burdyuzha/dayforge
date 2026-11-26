/**
 * Prompt of the day-plan parser (Russian). Order for prompt caching: the static part (rules, shared skill
 * rules, catalogs) is the system prompt — cached with the tool schema; the user turn carries the date, the
 * current time, the user's skills, the quests already on the date and the text.
 */
import { CATALOG_BLOCK, retryBlock, SKILL_RULES } from "../_shared/ai/prompts.ts";
import type { ToolRequest } from "../_shared/ai/provider.ts";
import { LIMITS, SUBMIT_TOOL_INPUT_SCHEMA, SUBMIT_TOOL_NAME } from "./schema.ts";
import type { PlanProviderInput } from "./types.ts";

export const SYSTEM_PROMPT = `Ты разбираешь утренний план дня пользователя приложения Dayforge — RPG, где реальные дела развивают персонажа.
Пользователь свободным текстом описывает, что собирается сделать в дату planDate. Твоя задача — превратить план в список пунктов (квестов) и для каждого определить время начала, длительность и навык, который он развивает.
Результат всегда возвращай одним вызовом инструмента ${SUBMIT_TOOL_NAME}.

Что такое пункт
- Пункт — одно действие из плана: тренировка, урок, работа над проектом, поручение, встреча.
- Не выдумывай пунктов, которых нет в тексте. Не дроби одно действие на несколько и не объединяй разные.
- Всё, что пользователь описал, относится к planDate. Не переноси пункты на другие дни и не добавляй ничего «на завтра».
- title — коротко, в форме действия, как в списке дел: «Пробежка 5 км», «Урок английского», «Купить продукты».

Время начала (startTime, "HH:MM")
- Явно указанное время используй как есть: «в 9» → "09:00", «в полвосьмого вечера» → "19:30", «к 15:00» → "15:00".
- Если время не указано — расставь по смыслу: «утром», «днём», «после работы», «вечером», «перед сном», а также по порядку перечисления. Ставь такие пункты в окне ${LIMITS.dayStart}–${LIMITS.dayEnd} и оставляй между соседними пунктами перерыв 10–15 минут. Учитывай пункты с явным временем и уже существующие квесты на эту дату, чтобы не ставить новые поверх них.
- Если isToday = true, ничего не ставь раньше nowLocal: всё, что пользователь планирует «утром», а утро уже прошло, ставь на ближайшее свободное время после nowLocal.
- startTime = null — только если время невозможно определить даже примерно (например, «когда-нибудь за день позвонить маме» в длинном плане без опор). Предпочитай разумное время.
- Пересечения по времени допустимы, если так сказал пользователь.

Длительность (durationMinutes)
- В минутах, от ${LIMITS.durationMin} до ${LIMITS.durationMax}, кратно 5. Явно указанную длительность используй как есть («полчаса» → 30, «полтора часа» → 90, «с 10 до 12» → 120).
- «Работа до 6» / «работаю с 9 до 18» — один пункт на этот интервал (максимум ${LIMITS.durationMax} минут).
- Если длительность не указана — оцени разумно для такого действия, поставь confidence "low" и в note напиши, что оценил сам (например, «длительность не указана, поставил 30 мин»).

Дубли (duplicateOfExisting)
- В контексте есть квесты, уже созданные на эту дату. Если пункт плана — это тот же квест (то же действие, даже другими словами), всё равно верни пункт, но с duplicateOfExisting = true. Иначе false.

${SKILL_RULES}

Уверенность
- confidence "high" — время, длительность и навык ясны из текста. "low" — ты что-то оценил или додумал; тогда note обязательно объясняет, что именно. Для "high" note = null.

${CATALOG_BLOCK}`;

/** User turn: date, time, the user's skills and quests on the date (as JSON), then the plan text */
export function buildUserMessage(input: PlanProviderInput): string {
  const context = {
    planDate: input.planDate,
    isToday: input.isToday,
    nowLocal: input.nowLocal,
    skills: input.context.skills.map((s) => ({
      id: s.id,
      name: s.name,
      aliases: s.aliases,
      attributes: s.attributes,
    })),
    existingQuests: input.context.quests.map((q) => ({
      title: q.title,
      startTime: q.startTime,
      durationMinutes: q.durationMinutes,
      status: q.status,
    })),
  };
  return [
    "Контекст пользователя (JSON):",
    JSON.stringify(context, null, 2),
    "",
    "План пользователя на день:",
    "<plan>",
    input.text,
    "</plan>",
    ...retryBlock(input.retry, SUBMIT_TOOL_NAME),
  ].join("\n");
}

export function buildDayPlanRequest(input: PlanProviderInput): ToolRequest {
  return {
    system: SYSTEM_PROMPT,
    tool: {
      name: SUBMIT_TOOL_NAME,
      description:
        "Сохранить пункты плана дня, извлечённые из текста пользователя. Вызывается ровно один раз.",
      inputSchema: SUBMIT_TOOL_INPUT_SCHEMA as unknown as Record<string, unknown>,
    },
    user: buildUserMessage(input),
  };
}
