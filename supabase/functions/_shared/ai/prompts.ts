/** Prompt blocks shared by parse-day-report and parse-day-plan (Russian). */
import type { RetryHint } from "./attempts.ts";
import { ATTRIBUTE_CODES, ATTRIBUTE_LABELS_RU, SKILL_ICONS } from "./catalog.ts";

/** How to pick a skill — the same rules for an event of the day and an item of the plan */
export const SKILL_RULES = `Навык (skill)
- Сначала сопоставь занятие с существующими навыками пользователя по смыслу, синонимам, сокращениям и псевдонимам (aliases): «англ», «english», «урок с репетитором по английскому» → навык «Английский». Тогда skill = { kind: "existing", skillId } — skillId только из списка навыков в контексте.
- Новый навык (kind: "new") предлагай, только если ни один существующий не подходит. name — короткое существительное в именительном падеже с большой буквы: «Английский», «Бег», «Программирование», «Гитара».
- attributes нового навыка: один атрибут, если навык однозначен; два — только если занятие явно развивает оба. Коды атрибутов — только из списка ниже.
- icon нового навыка — ключ из списка иконок ниже; если ничего не подходит — "misc".
- Если занятие не развивает никакого навыка — skill = { kind: "none" }. Это отдых, сериалы, сон, дорога, бытовые дела и поручения (уборка, покупки, звонки, оплата счетов), встречи без цели развития.
- «Работа» как общий блок без уточнения («работа», «на работе до 6») — kind "none". Навык — только если пользователь уточнил, что именно он развивает («на работе писал код на Go» → программирование).`;

/** The attribute and icon catalogs (static → part of the cached prefix) */
export const CATALOG_BLOCK = `Атрибуты (код — название):
${ATTRIBUTE_CODES.map((c) => `- ${c} — ${ATTRIBUTE_LABELS_RU[c]}`).join("\n")}

Иконки навыков (ключ — что означает):
${SKILL_ICONS.map((i) => `- ${i.key} — ${i.label}`).join("\n")}`;

/** Appended to the user turn on the retry after an invalid answer */
export function retryBlock(retry: RetryHint | undefined, toolName: string): string[] {
  if (!retry) return [];
  return [
    "",
    "Твой предыдущий ответ не прошёл проверку. Ошибка:",
    retry.validationError,
    "Предыдущий ответ:",
    JSON.stringify(retry.previousOutput ?? null),
    `Вызови ${toolName} ещё раз, исправив ошибку.`,
  ];
}
