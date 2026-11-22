import type React from "react";

import type { WolfBaseAssetProps } from "./assets/wolfAssetTypes";
import { WOLF_L1_FIT, WOLF_L1_POLYGONS } from "./assets/WolfL1AssetData";
import { WolfL1BaseAsset } from "./assets/WolfL1BaseAsset";
import { WOLF_L2_FIT, WOLF_L2_POLYGONS } from "./assets/WolfL2AssetData";
import { WolfL2BaseAsset } from "./assets/WolfL2BaseAsset";
import { WOLF_L3_FIT, WOLF_L3_POLYGONS } from "./assets/WolfL3AssetData";
import { WolfL3BaseAsset } from "./assets/WolfL3BaseAsset";
import { WOLF_L4_FIT, WOLF_L4_POLYGONS } from "./assets/WolfL4AssetData";
import { WolfL4BaseAsset } from "./assets/WolfL4BaseAsset";
import { WOLF_L5_FIT, WOLF_L5_POLYGONS } from "./assets/WolfL5AssetData";
import { WolfL5BaseAsset } from "./assets/WolfL5BaseAsset";

export interface WolfTierConfigItem {
  /** 1..5 — asset tier */
  tierIndex: 1 | 2 | 3 | 4 | 5;
  component: React.ComponentType<WolfBaseAssetProps>;
  /** canvas fit (fox rule: contained in 168 × 208, centred on 100,120 — see scripts/buildWolfAssets.mjs) */
  scale: number;
  tx: number;
  ty: number;
  viewBox: string;
  polygonCount: number;
  name: string;
}

const tier = (
  tierIndex: WolfTierConfigItem["tierIndex"],
  component: WolfTierConfigItem["component"],
  fit: { scale: number; tx: number; ty: number; viewBox: string },
  polygonCount: number,
  name: string,
): WolfTierConfigItem => ({ tierIndex, component, ...fit, polygonCount, name });

/** Same level thresholds as the fox (foxEvolutionConfig): 1–2, 3–9, 10–34, 35–49, 50+ */
export const WOLF_TIER_CONFIG = {
  1: tier(1, WolfL1BaseAsset, WOLF_L1_FIT, WOLF_L1_POLYGONS.length, "Pup"),
  3: tier(2, WolfL2BaseAsset, WOLF_L2_FIT, WOLF_L2_POLYGONS.length, "Young"),
  10: tier(3, WolfL3BaseAsset, WOLF_L3_FIT, WOLF_L3_POLYGONS.length, "Hunter"),
  35: tier(4, WolfL4BaseAsset, WOLF_L4_FIT, WOLF_L4_POLYGONS.length, "Ascended"),
  50: tier(5, WolfL5BaseAsset, WOLF_L5_FIT, WOLF_L5_POLYGONS.length, "Mythic"),
} as const satisfies Record<1 | 3 | 10 | 35 | 50, WolfTierConfigItem>;

export function getWolfTierConfig(level: number): WolfTierConfigItem {
  if (level < 3) return WOLF_TIER_CONFIG[1];
  if (level < 10) return WOLF_TIER_CONFIG[3];
  if (level < 35) return WOLF_TIER_CONFIG[10];
  if (level < 50) return WOLF_TIER_CONFIG[35];
  return WOLF_TIER_CONFIG[50];
}
