/** Friend codes: 8 characters without look-alikes (no 0/O, 1/I/L) — the same alphabet as the server */
const CODE_RE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/;
const PENDING_KEY = "dayforge:pending-friend-code";

/**
 * Turns user input into a code: case and spaces / dashes don't matter, a pasted invite link works too.
 * null — not a code.
 */
export function parseFriendCode(input: string): string | null {
  const fromLink = /\/invite\/([^/?#\s]+)/i.exec(input)?.[1];
  const code = (fromLink ?? input).toUpperCase().replace(/[\s-]/g, "");
  return CODE_RE.test(code) ? code : null;
}

export function inviteLink(code: string, origin = window.location.origin): string {
  return `${origin}/invite/${code}`;
}

/** The code of an invite opened before sign-up / sign-in — claimed on the next app entry */
export function readPendingFriendCode(): string | null {
  try {
    return localStorage.getItem(PENDING_KEY);
  } catch {
    return null;
  }
}

export function savePendingFriendCode(code: string): void {
  try {
    localStorage.setItem(PENDING_KEY, code);
  } catch {
    // private mode: the invite then works only while signed in
  }
}

export function clearPendingFriendCode(): void {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    // nothing to clear
  }
}
