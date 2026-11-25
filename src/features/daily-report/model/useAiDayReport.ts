import { useEffect, useState } from "react";

import { aiDayReportRepository } from "@/entities/daily-report/api/aiDayReportRepository";
import {
  type ApplyDayReportResult,
  clearDraft,
  DAY_REPORT_LIMITS,
  DayReportError,
  type EditableDayEvent,
  loadDraft,
  saveDraft,
  toEditableEvents,
  validateEvent,
} from "@/entities/daily-report/model/aiDayReport";

export type AiDayReportPhase = "input" | "parsing" | "preview" | "applying";

export interface UseAiDayReportOptions {
  reportDate: string;
  /** called after apply_day_report succeeded (draft already cleared) */
  onApplied: (result: ApplyDayReportResult, text: string) => void | Promise<void>;
}

const asDayReportError = (error: unknown) =>
  error instanceof DayReportError
    ? error
    : new DayReportError("UNKNOWN", error instanceof Error ? error.message : String(error));

/**
 * AI day report flow: text (draft saved per date) → parse → editable preview → apply.
 * Errors stay in `error` so the UI can offer the matching action (retry, manual marking, edit hours).
 */
export function useAiDayReport({ reportDate, onApplied }: UseAiDayReportOptions) {
  const [text, setText] = useState(() => loadDraft(reportDate));
  const [phase, setPhase] = useState<AiDayReportPhase>("input");
  const [events, setEvents] = useState<EditableDayEvent[]>([]);
  const [parseId, setParseId] = useState<string | null>(null);
  const [error, setError] = useState<DayReportError | null>(null);

  // autosave the draft for this date
  useEffect(() => {
    saveDraft(reportDate, text);
  }, [reportDate, text]);

  const trimmed = text.trim();
  const canParse =
    trimmed.length >= DAY_REPORT_LIMITS.textMin && trimmed.length <= DAY_REPORT_LIMITS.textMax;

  async function parse() {
    if (!canParse || phase === "parsing") return;
    setError(null);
    setPhase("parsing");
    try {
      const response = await aiDayReportRepository.parse(reportDate, trimmed);
      setEvents(toEditableEvents(response.events));
      setParseId(response.parseId);
      setPhase("preview");
    } catch (err) {
      setError(asDayReportError(err));
      setPhase("input");
    }
  }

  const invalid = events.map(validateEvent);
  const enabledCount = events.filter((e) => e.enabled).length;
  const canConfirm = phase === "preview" && parseId !== null && invalid.every((m) => m === null);

  async function confirm() {
    if (!canConfirm || !parseId) return;
    setError(null);
    setPhase("applying");
    try {
      const result = await aiDayReportRepository.apply(reportDate, events, parseId);
      clearDraft(reportDate);
      await onApplied(result, trimmed);
    } catch (err) {
      setError(asDayReportError(err));
      setPhase("preview");
    }
  }

  function updateEvent(key: string, patch: Partial<EditableDayEvent>) {
    setEvents((prev) => prev.map((e) => (e.key === key ? { ...e, ...patch } : e)));
  }

  function backToText() {
    setError(null);
    setPhase("input");
  }

  return {
    text,
    setText,
    phase,
    events,
    error,
    canParse,
    canConfirm,
    enabledCount,
    invalid,
    parse,
    confirm,
    updateEvent,
    backToText,
    dismissError: () => setError(null),
  };
}
