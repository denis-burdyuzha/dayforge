/**
 * avatarTypes.ts — Data contract of the creature avatar.
 *
 * The renderers (FoxAvatar, AssetCreatureAvatar) only consume AvatarParams; progression / attribute /
 * class logic lives in avatarEngine.computeAvatarParams.
 */

import type { AvatarAspect } from "./aspect";
import type { AttributeKey } from "./types";

export interface AvatarIdentity {
  /** Stable per-character key (character id) — base for deterministic attribute FX seeds */
  seedKey: string;
}

export interface AvatarEvolutionStage {
  /** 7-step evolution tier by level (1, 3, 5, 10, 20, 35, 50) — tier FX matrices, aura, shadow */
  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Character level — picks the asset tier (5 assets per creature) and the tier FX */
  level?: number;
  classArchetype: "warrior" | "creator" | "explorer" | "strategist" | "wanderer";
}

export interface AvatarParams {
  identity: AvatarIdentity;
  evolution: AvatarEvolutionStage;
  /** If true, renders the creature as a dark silhouette */
  silhouetteOnly?: boolean;

  /** Raw attribute values 1..18 — aspect, shadow size, the archived attribute FX (attributeFx/) */
  attributeValues: Record<AttributeKey, number>;

  /**
   * Dominant attribute (≥ 3): colours rim light, aura and the aspect accent polygons in every creature.
   * null → neutral glow, asset colours.
   */
  aspect: AvatarAspect | null;
}
