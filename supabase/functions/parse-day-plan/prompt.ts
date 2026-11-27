/**
 * Prompt of the day-plan parser (Russian). Order for prompt caching: the static part (rules, shared skill
 * rules, catalogs) is the system prompt — cached with the tool schema; the user turn carries the date, the
 * current time, the user's skills, the quests already on the date and the text.
 */
import { CATALOG_BLOCK, retryBlock, SKILL_RULES } from "../_shared/ai/prompts.ts";
import type { ToolRequest } from "../_shared/ai/provider.ts";
import { toMinutes } from "../_shared/ai/userDay.ts";
import { LIMITS, SUBMIT_TOOL_INPUT_SCHEMA, SUBMIT_TOOL_NAME } from "./schema.ts";
import type { PlanProviderInput } from "./types.ts";

export const SYSTEM_PROMPT = `Ты разбираешь план дня пользователя приложения Dayforge — RPG, где реальные дела развивают персонажа.
Пользователь свободным текстом описывает, что собирается сделать в дату planDate (иногда часть дел — на следующий день, nextDate). Твоя задача — превратить план в список пунктов (квестов) и для каждого определить дату, время начала, длительность и навык, который он развивает.
Результат всегда возвращай одним вызовом инструмента ${SUBMIT_TOOL_NAME}.

Что такое пункт
- Пункт — одно действие из плана: тренировка, урок, работа над проектом, поручение, встреча, еда («потом обед» — тоже пункт).
- Не выдумывай пунктов, которых нет в тексте. Не дроби одно действие на несколько и не объединяй разные.
- Сон и отход ко сну («и спать», «лягу в 23») — не пункт плана.
- title — коротко, в форме действия, как в списке дел: «Пробежка 5 км», «Урок английского», «Купить продукты».

Дата пункта (date)
- По умолчанию date = "plan" — пункт относится к planDate.
- date = "next" (nextDate), только если в тексте явно сказано «завтра» про этот пункт или пункт явно относится к следующему дню. Единственный случай без слова «завтра»: planDateStatus = "in_progress", сейчас вечер (nowLocal не раньше 18:00), и в плане есть «утром …» — утро сегодня уже прошло, значит это утро следующего дня → "next".
- Днём (nowLocal раньше 18:00) прошедшее «утро» сегодняшнего плана на завтра НЕ переносится: date = "plan", время — после nowLocal.
- Если planDateStatus = "ahead" (дата плана ещё не наступила — например, ночью после полуночи или вечером на завтра), всё утро, день и вечер planDate впереди; «завтра» в тексте в этом случае обычно и означает planDate → "plan".
- Не выдумывай пунктов на другие дни и не переноси пункт на следующий день только потому, что он не влез.

Время начала (startTime, "HH:MM")
- Явно указанное время используй как есть: «в 9» → "09:00", «в полвосьмого вечера» → "19:30", «к 15:00» → "15:00".
- Если время не указано — расставь по смыслу: «утром», «днём», «после работы», «вечером», «перед сном», а также по порядку перечисления. Ставь такие пункты в окне ${LIMITS.dayStart}–${LIMITS.dayEnd} и оставляй между соседними пунктами перерыв 10–15 минут. Учитывай пункты с явным временем и уже существующие квесты на эту дату, чтобы не ставить новые поверх них.
- Текущий момент — дата nowDate и время nowLocal; planDateStatus: "in_progress" — planDate идёт сейчас (часть его времени уже прошла), "ahead" — planDate ещё впереди. Пункты не должны начинаться раньше текущего момента: если planDateStatus = "in_progress" и время пункта прошло, ставь его на ближайшее свободное время после nowLocal (с округлением до 5 минут), следующие пункты — за ним по порядку. То, что время прошло, — не повод оставлять startTime пустым.
- Ночь до границы дня (dayStartTime) пользователь считает продолжением предыдущего дня. Пример: сейчас 01:00, граница 04:00, planDate = nowDate — planDateStatus = "ahead" по смыслу: впереди всё утро, день и вечер, ставь пункты обычным образом.
- Поручения и дела без указанного времени («оплатить коммуналку, купить продукты») тоже расставь: подряд, в разумное для них время дня, по порядку перечисления.
- startTime = null — исключение: только если пункт не помещается в окно ${LIMITS.dayStart}–${LIMITS.dayEnd} после остальных. В остальных случаях всегда ставь время.
- Пересечения по времени допустимы, если так сказал пользователь.

Длительность (durationMinutes)
- В минутах, от ${LIMITS.durationMin} до ${LIMITS.durationMax}, кратно 5. Явно указанную длительность используй как есть («полчаса» → 30, «полтора часа» → 90, «с 10 до 12» → 120).
- «Работа до 6» / «работаю с 9 до 18» — один пункт на этот интервал (максимум ${LIMITS.durationMax} минут).
- Если длительность не указана — оцени разумно для такого действия, поставь confidence "low" и в note напиши, что оценил сам (например, «длительность не указана, поставил 30 мин»).

Дубли (duplicateOfExisting)
- В контексте есть квесты, уже созданные на planDate и nextDate (у каждого есть date). Если пункт плана — это тот же квест на ТУ ЖЕ дату (то же действие, даже другими словами), всё равно верни пункт, но с duplicateOfExisting = true. Иначе false. План можно дописывать: новые пункты к уже существующим квестам — норма.

${SKILL_RULES}

Уверенность
- confidence "high" — время, длительность и навык ясны из текста. "low" — ты что-то оценил или додумал; тогда note обязательно объясняет, что именно. Для "high" note = null.

${CATALOG_BLOCK}`;

/**
 * "in_progress" — the plan date is the user's day that is going on now and its morning has begun (now is past the
 * day boundary on that calendar date); "ahead" — the plan date has not started yet (a later date, or the night
 * before the boundary when the plan date is the calendar today).
 */
export function planDateStatus(
  input: Pick<PlanProviderInput, "planDate" | "nowDate" | "nowLocal" | "dayStartTime">,
): "in_progress" | "ahead" {
  if (input.planDate > input.nowDate) return "ahead";
  if (input.planDate === input.nowDate && toMinutes(input.nowLocal) < toMinutes(input.dayStartTime))
    return "ahead";
  return "in_progress";
}

/** User turn: date, time, the user's skills and quests on the date (as JSON), then the plan text */
export function buildUserMessage(input: PlanProviderInput): string {
  const context = {
    planDate: input.planDate,
    nextDate: input.nextDate,
    isToday: input.isToday,
    planDateStatus: planDateStatus(input),
    nowDate: input.nowDate,
    nowLocal: input.nowLocal,
    dayStartTime: input.dayStartTime,
    skills: input.context.skills.map((s) => ({
      id: s.id,
      name: s.name,
      aliases: s.aliases,
      attributes: s.attributes,
    })),
    existingQuests: input.context.quests.map((q) => ({
      date: q.date,
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
