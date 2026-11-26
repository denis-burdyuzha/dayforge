/** LION_FX_MATRIX — tier FX of the lion (Strategist): the same values per tier as the wolf. */
import type { TierFxMatrix } from "../../tierFx";
import { WOLF_FX_MATRIX } from "../wolf/wolfFxMatrix";

export const LION_FX_MATRIX: TierFxMatrix = { ...WOLF_FX_MATRIX };
