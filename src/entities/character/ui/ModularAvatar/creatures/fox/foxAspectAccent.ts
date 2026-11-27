/**
 * Aspect accent polygons of the fox tiers (`aspectAccentIds`): the eyes zone + the glowing tail tips.
 * The fox SVGs carry no `aspectAccent` group, so the list is derived from the zoned asset data — the tail
 * tips are the same polygons the old fox-only recolour used: tail zones with a warm fill (incl. their
 * shaded rust/brown facets, hence the loose saturation / lightness thresholds).
 */
import { isWarmAccent } from "../../../../model/aspect";

const EYE_ZONES = new Set(["eyes"]);
const TAIL_ZONES = new Set(["tail", "tailTip", "tailArray"]);
const TAIL_TIP_MIN_SAT = 0.12;
const TAIL_TIP_MIN_LIGHT = 0.12;

/** ids of the accent polygons among the polygons of one fox tier (eyes + warm tail tips) */
export function computeFoxAspectAccentIds(
  polygons: ReadonlyArray<{ id: string; zone: string; defaultFill: string }>,
): string[] {
  return polygons
    .filter(
      (p) =>
        EYE_ZONES.has(p.zone) ||
        (TAIL_ZONES.has(p.zone) &&
          isWarmAccent(p.defaultFill, TAIL_TIP_MIN_SAT, TAIL_TIP_MIN_LIGHT)),
    )
    .map((p) => p.id);
}
