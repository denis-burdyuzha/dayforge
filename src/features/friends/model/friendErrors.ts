const MESSAGES: Record<string, string> = {
  INVALID_CODE: "Такого кода нет — проверь и попробуй ещё раз",
  CANNOT_FRIEND_SELF: "Это твой собственный код",
  FRIEND_LIMIT: "Достигнут лимит — 100 друзей",
  RATE_LIMIT: "Слишком много новых друзей за сутки — попробуй завтра",
  NOT_FRIENDS: "Вы больше не друзья",
  CHARACTER_NOT_FOUND: "Сначала создай персонажа",
  NOT_AUTHENTICATED: "Войди в аккаунт",
};

/** Codes after which a saved invite should not be retried */
const FINAL_CODES = [
  "INVALID_CODE",
  "CANNOT_FRIEND_SELF",
  "FRIEND_LIMIT",
  "RATE_LIMIT",
  "NOT_FRIENDS",
];

function rawMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function isNetworkError(error: unknown): boolean {
  return /Failed to fetch|NetworkError|network|Load failed/i.test(rawMessage(error));
}

/** A readable Russian message for an error of the friends RPCs */
export function friendErrorMessage(error: unknown): string {
  const raw = rawMessage(error);
  const code = Object.keys(MESSAGES).find((c) => raw.includes(c));
  if (code) return MESSAGES[code] ?? raw;
  if (isNetworkError(error)) return "Нет связи — попробуй ещё раз";
  return "Что-то пошло не так — попробуй ещё раз";
}

/** true — retrying the same request won't help (the saved invite can be dropped) */
export function isFinalFriendError(error: unknown): boolean {
  const raw = rawMessage(error);
  return FINAL_CODES.some((c) => raw.includes(c));
}
