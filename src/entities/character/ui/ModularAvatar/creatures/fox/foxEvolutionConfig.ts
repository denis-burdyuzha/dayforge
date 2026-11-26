import type React from "react";

import type { FoxBaseAssetProps } from "../../assets/foxAssetTypes";
import { FoxL1BaseAsset } from "../../assets/FoxL1BaseAsset";
import { FoxL2BaseAsset } from "../../assets/FoxL2BaseAsset";
import { FoxL3BaseAsset } from "../../assets/FoxL3BaseAsset";
import { FoxL4BaseAsset } from "../../assets/FoxL4BaseAsset";
import { FoxL5BaseAsset } from "../../assets/FoxL5BaseAsset";
import { getFoxAspectAccentIds } from "./foxAspectAccent";
import type { FoxTierIndex } from "./foxZones";

export interface FoxTierConfigItem {
  /** 1..5 - asset tier (L1 curled .. L5 mythic); used to pick zones */
  tierIndex: FoxTierIndex;
  component: React.ComponentType<FoxBaseAssetProps>;
  scale: number;
  tx: number;
  ty: number;
  viewBox: string;
  polygonCount: number;
  name: string;
  /** polygons recoloured into the aspect colour: eyes + tail tips (shared aspect accent) */
  aspectAccentIds: readonly string[];
}

export const FOX_TIER_CONFIG: Record<1 | 3 | 10 | 35 | 50, FoxTierConfigItem> = {
  1: {
    tierIndex: 1,
    aspectAccentIds: getFoxAspectAccentIds(1),
    component: FoxL1BaseAsset,
    scale: 0.4541,
    tx: -3.98,
    ty: -56.63,
    viewBox: "0 0 468 767",
    polygonCount: 238,
    name: "Spark / Larval",
  },
  3: {
    tierIndex: 2,
    aspectAccentIds: getFoxAspectAccentIds(2),
    component: FoxL2BaseAsset,
    scale: 0.228,
    tx: 5.74,
    ty: 25.29,
    viewBox: "0 0 832 818",
    polygonCount: 438,
    name: "Hatchling",
  },
  10: {
    tierIndex: 3,
    aspectAccentIds: getFoxAspectAccentIds(3),
    component: FoxL3BaseAsset,
    scale: 0.4038,
    tx: 12.77,
    ty: 38.22,
    viewBox: "0 0 445 402",
    polygonCount: 277,
    name: "Young / Awakened",
  },
  35: {
    tierIndex: 4,
    aspectAccentIds: getFoxAspectAccentIds(4),
    component: FoxL4BaseAsset,
    scale: 0.3531,
    tx: 21.96,
    ty: 11.06,
    viewBox: "0 0 443 624",
    polygonCount: 383,
    name: "Ascended",
  },
  50: {
    tierIndex: 5,
    aspectAccentIds: getFoxAspectAccentIds(5),
    component: FoxL5BaseAsset,
    scale: 0.1755,
    tx: 19.96,
    ty: -1.73,
    viewBox: "0 0 912 1312",
    polygonCount: 935,
    name: "Mythic",
  },
};

/**
 * Returns the corresponding tier config object for the specified level threshold:
 * level < 3   -> L1
 * level < 10  -> L2 (key 3)
 * level < 35  -> L3 (key 10)
 * level < 50  -> L4 (key 35)
 * level >= 50 -> L5 (key 50)
 */
export function getFoxTierConfigForLevel(level: number): FoxTierConfigItem {
  if (level < 3) return FOX_TIER_CONFIG[1];
  if (level < 10) return FOX_TIER_CONFIG[3];
  if (level < 35) return FOX_TIER_CONFIG[10];
  if (level < 50) return FOX_TIER_CONFIG[35];
  return FOX_TIER_CONFIG[50];
}

/**
 * Unified resolver for fox tier config accepting either a level number or object { level?, tier? }
 */
export function getFoxTierConfig(
  input?: { level?: number; tier?: number } | number,
): FoxTierConfigItem {
  if (typeof input === "number") {
    return getFoxTierConfigForLevel(input);
  }
  const level = input?.level;
  if (typeof level === "number") {
    return getFoxTierConfigForLevel(level);
  }
  const tier = input?.tier ?? 1;
  if (tier <= 1) return FOX_TIER_CONFIG[1];
  if (tier <= 2) return FOX_TIER_CONFIG[3];
  if (tier <= 4) return FOX_TIER_CONFIG[10];
  if (tier <= 6) return FOX_TIER_CONFIG[35];
  return FOX_TIER_CONFIG[50];
}
