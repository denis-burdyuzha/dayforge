/**
 * Fox → universal CreatureAnatomy adapter (the only fox-specific piece of the attribute FX system).
 * Zone names come from foxZoneRegistry / the grouped SVG data of each tier.
 */

import { buildAnatomy, type CreatureAnatomy } from "../../attributeFx/anatomy";
import { FOX_TIER_CONFIG } from "./foxEvolutionConfig";
import { FOX_LIMB_ZONES_BY_TIER } from "./foxZoneRegistry";
import { type FoxTierIndex, getTierPolys } from "./foxZones";

const cache = new Map<FoxTierIndex, CreatureAnatomy>();

function viewBoxOf(tier: FoxTierIndex): { w: number; h: number } {
  const cfg = Object.values(FOX_TIER_CONFIG).find((c) => c.tierIndex === tier);
  const [, , w, h] = (cfg?.viewBox ?? "0 0 200 240").split(/\s+/).map(Number);
  return { w: w ?? 200, h: h ?? 240 };
}

export function getFoxAnatomy(tier: FoxTierIndex): CreatureAnatomy {
  const hit = cache.get(tier);
  if (hit) return hit;
  const anatomy = buildAnatomy({
    polygons: getTierPolys(tier),
    zones: {
      head: ["head"],
      torso: ["torso"],
      eyes: ["eyes"],
      limbs: FOX_LIMB_ZONES_BY_TIER[tier],
      tail: ["tail", "tailTip", "tailArray"],
    },
    viewBox: viewBoxOf(tier),
  });
  cache.set(tier, anatomy);
  return anatomy;
}
