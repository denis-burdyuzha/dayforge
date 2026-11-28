/**
 * Character name rules — the same as the server (`_check_character_name`): 2–20 characters after trim; letters of any
 * alphabet, digits, space, «-», «_»; no double spaces. Banned words are checked only on the server
 * (NAME_NOT_ALLOWED).
 */
import { z } from "zod";

export const CHARACTER_NAME_MIN = 2;
export const CHARACTER_NAME_MAX = 20;
const NAME_CHARS = /^[\p{L}\p{N} _-]+$/u;

export const characterNameSchema = z
  .string()
  .trim()
  .min(CHARACTER_NAME_MIN, `Имя — от ${CHARACTER_NAME_MIN} до ${CHARACTER_NAME_MAX} символов`)
  .max(CHARACTER_NAME_MAX, `Имя — от ${CHARACTER_NAME_MIN} до ${CHARACTER_NAME_MAX} символов`)
  .refine((v) => NAME_CHARS.test(v), "Только буквы, цифры, пробел, дефис и подчёркивание")
  .refine((v) => !v.includes("  "), "Без двойных пробелов");

/** A readable message for an error of rename_character / complete_onboarding about the name */
export function characterNameErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (/NAME_NOT_ALLOWED/.test(raw)) return "Такое имя нельзя — выбери другое";
  if (/INVALID_NAME/.test(raw))
    return `Имя — от ${CHARACTER_NAME_MIN} до ${CHARACTER_NAME_MAX} символов: буквы, цифры, пробел, дефис, подчёркивание`;
  if (/Failed to fetch|NetworkError|network/i.test(raw)) return "Нет связи — имя не сохранено";
  return "Не удалось сохранить имя";
}
