/**
 * AI day plan API: Edge Function parse-day-plan and RPC apply_day_plan. Every failure becomes a DayPlanError
 * with a code the UI can act on.
 */
import { supabase } from "@/shared/api/supabase/client";

import {
  type ApplyDayPlanResult,
  browserTimezone,
  DayPlanError,
  type EditablePlanItem,
  nowLocalHHMM,
  type ParseDayPlanResponse,
  toApplyPayload,
} from "../model/aiDayPlan";
import { mapPlanFunctionError, mapPlanRpcError } from "./aiDayPlanErrors";

export const aiDayPlanRepository = {
  async parse(planDate: string, text: string): Promise<ParseDayPlanResponse> {
    let result: Awaited<ReturnType<typeof supabase.functions.invoke<ParseDayPlanResponse>>>;
    try {
      result = await supabase.functions.invoke<ParseDayPlanResponse>("parse-day-plan", {
        body: { planDate, text, nowLocal: nowLocalHHMM(), timezone: browserTimezone() },
      });
    } catch (error) {
      throw await mapPlanFunctionError(error);
    }
    if (result.error) throw await mapPlanFunctionError(result.error);
    if (!result.data) throw new DayPlanError("AI_ERROR", "Пустой ответ");
    return result.data;
  },

  async apply(
    planDate: string,
    items: ReadonlyArray<EditablePlanItem>,
    parseId: string,
  ): Promise<ApplyDayPlanResult> {
    let response: Awaited<ReturnType<typeof callApply>>;
    try {
      response = await callApply(planDate, items, parseId);
    } catch (error) {
      throw mapPlanRpcError({ message: error instanceof Error ? error.message : String(error) });
    }
    if (response.error) throw mapPlanRpcError(response.error);
    return response.data as unknown as ApplyDayPlanResult;
  },
};

function callApply(planDate: string, items: ReadonlyArray<EditablePlanItem>, parseId: string) {
  return supabase.rpc("apply_day_plan", {
    p_plan_date: planDate,
    p_items: toApplyPayload(items),
    p_parse_id: parseId,
  });
}
