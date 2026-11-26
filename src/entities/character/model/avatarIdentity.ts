/**
 * avatarIdentity.ts — Deterministic identity of the creature avatar.
 *
 * The seed key is the character id (stable across reloads and pages); the attribute FX derive their
 * deterministic randomness from it (ui/ModularAvatar/attributeFx/fxSeed).
 */

import type { AvatarIdentity } from "./avatarTypes";

/** 32-bit FNV-1a hash implementation */
export function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
    hash >>>= 0;
  }
  return hash;
}

export function createAvatarIdentity(characterId: string | undefined): AvatarIdentity {
  return { seedKey: characterId || "dayforge-default-character-seed" };
}
