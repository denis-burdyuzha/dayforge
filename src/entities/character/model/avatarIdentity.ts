/**
 * avatarIdentity.ts — Deterministic identity generator for Modular Vector Avatar.
 *
 * Derives stable pseudo-random seeds from user/character ID using FNV-1a hash.
 * Ensures the character's core features (hair style, face shape, subtle proportions)
 * remain 100% consistent across reloads and pages.
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

/** Returns deterministic float in range [0, 1) */
function seededFloat(seed: number, salt: string): number {
  const hash = fnv1a(`${seed}:${salt}`);
  return (hash >>> 0) / 4294967296;
}

export function createAvatarIdentity(characterId: string | undefined): AvatarIdentity {
  const key = characterId || "dayforge-default-character-seed";
  const baseSeed = fnv1a(key);

  return {
    seedKey: key,
    bodySeed: seededFloat(baseSeed, "body"),
    faceSeed: seededFloat(baseSeed, "face"),
    eyeSeed: seededFloat(baseSeed, "eye"),
    earSeed: seededFloat(baseSeed, "ear"),
    tailSeed: seededFloat(baseSeed, "tail"),
    patternSeed: seededFloat(baseSeed, "pattern"),
    colorSeed: seededFloat(baseSeed, "color"),
    proportionsSeed: seededFloat(baseSeed, "proportions"),
  };
}
