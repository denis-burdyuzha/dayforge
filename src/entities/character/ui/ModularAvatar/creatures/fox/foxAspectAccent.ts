/**
 * Aspect accent polygons of the fox tiers (`aspectAccentIds`): the eyes zone + the glowing tail tips.
 * The fox SVGs carry no `aspectAccent` group, so the list is derived from the zoned asset data — the tail
 * tips are the same polygons the old fox-only recolour used: tail zones with a warm fill (incl. their
 * shaded rust/brown facets, hence the loose saturation / lightness thresholds).
 */
import { isWarmAccent } from "../../../../model/aspect";
import { type FoxTierIndex, getTierPolys } from "./foxZones";

const EYE_ZONES = new Set(["eyes"]);
const TAIL_ZONES = new Set(["tail", "tailTip", "tailArray"]);
const TAIL_TIP_MIN_SAT = 0.12;
const TAIL_TIP_MIN_LIGHT = 0.12;

const cache = new Map<FoxTierIndex, readonly string[]>();

export function getFoxAspectAccentIds(tier: FoxTierIndex): readonly string[] {
  const hit = cache.get(tier);
  if (hit) return hit;
  const ids = getTierPolys(tier)
    .filter(
      (p) =>
        EYE_ZONES.has(p.zone) ||
        (TAIL_ZONES.has(p.zone) &&
          isWarmAccent(p.defaultFill, TAIL_TIP_MIN_SAT, TAIL_TIP_MIN_LIGHT)),
    )
    .map((p) => p.id);
  cache.set(tier, ids);
  return ids;
}
