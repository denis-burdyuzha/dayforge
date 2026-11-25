/**
 * AI day report API: Edge Function parse-day-report and RPC apply_day_report. Every failure becomes a
 * DayReportError with a code the UI can act on.
 */
import { supabase } from "@/shared/api/supabase/client";

import {
  type ApplyDayReportResult,
  DayReportError,
  type EditableDayEvent,
  type ParseDayReportResponse,
  toApplyPayload,
} from "../model/aiDayReport";
import { mapFunctionError, mapRpcError } from "./aiDayReportErrors";

export const aiDayReportRepository = {
  async parse(reportDate: string, text: string): Promise<ParseDayReportResponse> {
    let result: Awaited<ReturnType<typeof supabase.functions.invoke<ParseDayReportResponse>>>;
    try {
      result = await supabase.functions.invoke<ParseDayReportResponse>("parse-day-report", {
        body: { reportDate, text },
      });
    } catch (error) {
      throw await mapFunctionError(error);
    }
    if (result.error) throw await mapFunctionError(result.error);
    if (!result.data) throw new DayReportError("AI_ERROR", "Пустой ответ");
    return result.data;
  },

  async apply(
    reportDate: string,
    events: ReadonlyArray<EditableDayEvent>,
    parseId: string,
  ): Promise<ApplyDayReportResult> {
    let response: Awaited<ReturnType<typeof callApply>>;
    try {
      response = await callApply(reportDate, events, parseId);
    } catch (error) {
      throw mapRpcError({ message: error instanceof Error ? error.message : String(error) });
    }
    if (response.error) throw mapRpcError(response.error);
    return response.data as unknown as ApplyDayReportResult;
  },
};

function callApply(reportDate: string, events: ReadonlyArray<EditableDayEvent>, parseId: string) {
  return supabase.rpc("apply_day_report", {
    p_report_date: reportDate,
    p_events: toApplyPayload(events),
    p_parse_id: parseId,
  });
}
