/** Error mapping of the AI day plan API (no Supabase client here — importable in tests). */
import { readFunctionError, readRpcError } from "@/shared/api/supabase/aiApiErrors";

import { DAY_PLAN_ERROR_CODES, DayPlanError, type DayPlanErrorCode } from "../model/aiDayPlan";

export async function mapPlanFunctionError(error: unknown): Promise<DayPlanError> {
  const info = await readFunctionError(error, DAY_PLAN_ERROR_CODES, "AI_ERROR");
  return new DayPlanError(info.code as DayPlanErrorCode, info.message);
}

export function mapPlanRpcError(error: { message: string; details?: string | null }): DayPlanError {
  const info = readRpcError(error, DAY_PLAN_ERROR_CODES);
  return new DayPlanError(info.code as DayPlanErrorCode, info.message, info.details);
}
