/** Which asset a class renders at a level, and how many polygons take the aspect colour (playground info). */
import type { AvatarEvolutionStage } from "../../model/avatarTypes";
import { creatureTierAsset, getCreature } from "./creatures/creatureRegistry";
import { getFoxTierConfig } from "./creatures/fox/foxEvolutionConfig";
import { assetTierForLevel } from "./tierFx";

export interface AvatarAssetInfo {
  /** SVG file the tier asset was built from */
  source: string;
  /** tier whose SVG is used because this tier has none yet; null = own SVG */
  fallbackFrom: number | null;
  tier: 1 | 2 | 3 | 4 | 5;
  aspectAccentCount: number;
}

export function getAvatarAssetInfo(
  classId: AvatarEvolutionStage["classArchetype"],
  level: number,
): AvatarAssetInfo {
  const creature = getCreature(classId);
  if (creature) {
    const tier = assetTierForLevel(level);
    const asset = creatureTierAsset(creature, tier);
    return {
      source: asset.source,
      fallbackFrom: asset.fallbackFrom,
      tier,
      aspectAccentCount: asset.aspectAccentCount,
    };
  }
  const fox = getFoxTierConfig(level);
  return {
    source: `foxL${fox.tierIndex}.svg`,
    fallbackFrom: null,
    tier: fox.tierIndex,
    aspectAccentCount: fox.aspectAccentCount,
  };
}
