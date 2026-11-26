/**
 * Prompt of the day-report parser (Russian). Order for prompt caching: the static part (rules, skill rules,
 * catalogs) is the system prompt — cached with the tool schema; the user turn carries the user's skills,
 * planned quests and the text.
 */
import { CATALOG_BLOCK, retryBlock, SKILL_RULES } from "../_shared/ai/prompts.ts";
import type { ToolRequest } from "../_shared/ai/provider.ts";
import { SUBMIT_TOOL_INPUT_SCHEMA, SUBMIT_TOOL_NAME } from "./schema.ts";
import type { ProviderInput } from "./types.ts";

export const SYSTEM_PROMPT = `Ты разбираешь вечерний отчёт пользователя приложения Dayforge — RPG, где реальные дела развивают персонажа.
Пользователь свободным текстом описывает свой день. Твоя задача — выделить из текста события (чем он занимался) и для каждого события определить длительность, связь с запланированным квестом и навык, который это развивает.
Результат всегда возвращай одним вызовом инструмента ${SUBMIT_TOOL_NAME}.

Что такое событие
- Событие — одно занятие, которое пользователь реально сделал сегодня: тренировка, урок, работа над проектом, уборка, прогулка.
- Не выдумывай событий, которых нет в тексте. Планы на завтра, желания и то, что пользователь НЕ сделал («хотел пойти в зал, но не пошёл»), — не события.
- Если одно занятие упомянуто несколько раз («утром кодил, вечером опять кодил»), объедини его в одно событие и сложи время.
- Если пользователь пишет, что ничего не делал, верни пустой список events.
- description — коротко, своими словами, как пользователь это сделал: «Пробежка 5 км в парке», «Урок английского с репетитором».

Длительность (hours)
- В часах, от 0.1 до 8, с шагом 0.1 («полчаса» → 0.5, «40 минут» → 0.7).
- Если длительность не указана — оцени разумно для такого занятия, поставь confidence "low" и в note напиши, что оценил сам (например, «длительность не указана, поставил 0.5 ч»).
- Если указано больше 8 часов на одно занятие или время явно преувеличено («кодил 20 часов»), поставь не больше 8, confidence "low" и объясни в note.

Связь с планом (plannedQuestId)
- В контексте есть незавершённые квесты, запланированные на эту дату (у некоторых есть время начала startTime). Если текст явно говорит именно об этом квесте, укажи его id в plannedQuestId.
- Если связь не очевидна — null. Не связывай одно событие с несколькими квестами и один квест с несколькими событиями.

${SKILL_RULES}

Уверенность
- confidence "high" — всё ясно из текста. "low" — ты что-то оценил или додумал; тогда note обязательно объясняет, что именно. Для "high" note = null.

${CATALOG_BLOCK}`;

/** User turn: the date, the user's skills and planned quests (as JSON), then the report text */
export function buildUserMessage(input: ProviderInput): string {
  const context = {
    reportDate: input.reportDate,
    skills: input.context.skills.map((s) => ({
      id: s.id,
      name: s.name,
      aliases: s.aliases,
      attributes: s.attributes,
    })),
    plannedQuests: input.context.plannedQuests.map((q) => ({
      id: q.id,
      title: q.title,
      skill: q.skill,
      ...(q.startTime ? { startTime: q.startTime } : {}),
    })),
  };
  return [
    "Контекст пользователя (JSON):",
    JSON.stringify(context, null, 2),
    "",
    "Отчёт пользователя за день:",
    "<report>",
    input.text,
    "</report>",
    ...retryBlock(input.retry, SUBMIT_TOOL_NAME),
  ].join("\n");
}

export function buildDayReportRequest(input: ProviderInput): ToolRequest {
  return {
    system: SYSTEM_PROMPT,
    tool: {
      name: SUBMIT_TOOL_NAME,
      description:
        "Сохранить события дня, извлечённые из отчёта пользователя. Вызывается ровно один раз.",
      inputSchema: SUBMIT_TOOL_INPUT_SCHEMA as unknown as Record<string, unknown>,
    },
    user: buildUserMessage(input),
  };
}
