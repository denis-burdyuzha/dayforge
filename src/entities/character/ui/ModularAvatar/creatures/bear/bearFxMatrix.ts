/** BEAR_FX_MATRIX — tier FX of the bear (Creator): the same values per tier as the wolf. */
import type { TierFxMatrix } from "../../tierFx";
import { WOLF_FX_MATRIX } from "../wolf/wolfFxMatrix";

export const BEAR_FX_MATRIX: TierFxMatrix = { ...WOLF_FX_MATRIX };
