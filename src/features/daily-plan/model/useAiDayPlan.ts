import { useEffect, useMemo, useState } from "react";

import { aiDayPlanRepository } from "@/entities/daily-plan/api/aiDayPlanRepository";
import {
  type ApplyDayPlanResult,
  DAY_PLAN_LIMITS,
  DayPlanError,
  type EditablePlanItem,
  findOverlaps,
  planDrafts,
  sortByTime,
  type TimedEntry,
  toEditableItems,
  totalMinutes,
  validateItem,
} from "@/entities/daily-plan/model/aiDayPlan";

export type AiDayPlanPhase = "input" | "parsing" | "preview" | "applying";

export interface UseAiDayPlanOptions {
  planDate: string;
  /** quests already on the plan — for the «Пересекается с …» warnings */
  existingQuests: ReadonlyArray<TimedEntry>;
  /** called after apply_day_plan succeeded (draft already cleared) */
  onApplied: (result: ApplyDayPlanResult) => void | Promise<void>;
}

const asDayPlanError = (error: unknown) =>
  error instanceof DayPlanError
    ? error
    : new DayPlanError("UNKNOWN", error instanceof Error ? error.message : String(error));

/**
 * AI day plan flow: text (draft saved per date) → parse → editable preview → apply.
 * Errors stay in `error`; on PLAN_HOURS_LIMIT the preview stays for editing.
 */
export function useAiDayPlan({ planDate, existingQuests, onApplied }: UseAiDayPlanOptions) {
  const [text, setText] = useState(() => planDrafts.load(planDate));
  const [phase, setPhase] = useState<AiDayPlanPhase>("input");
  const [items, setItems] = useState<EditablePlanItem[]>([]);
  const [parseId, setParseId] = useState<string | null>(null);
  const [error, setError] = useState<DayPlanError | null>(null);

  useEffect(() => {
    planDrafts.save(planDate, text);
  }, [planDate, text]);

  const trimmed = text.trim();
  const canParse =
    trimmed.length >= DAY_PLAN_LIMITS.textMin && trimmed.length <= DAY_PLAN_LIMITS.textMax;

  async function parse() {
    if (!canParse || phase === "parsing") return;
    setError(null);
    setPhase("parsing");
    try {
      const response = await aiDayPlanRepository.parse(planDate, trimmed);
      setItems(toEditableItems(response.items));
      setParseId(response.parseId);
      setPhase("preview");
    } catch (err) {
      setError(asDayPlanError(err));
      setPhase("input");
    }
  }

  const invalid = items.map(validateItem);
  const enabled = items.filter((i) => i.enabled);
  const minutes = totalMinutes(items);
  const canConfirm =
    phase === "preview" &&
    parseId !== null &&
    enabled.length > 0 &&
    invalid.every((m) => m === null);

  const overlaps = useMemo(
    () =>
      findOverlaps(
        items.filter((i) => i.enabled),
        existingQuests,
      ),
    [items, existingQuests],
  );

  async function confirm() {
    if (!canConfirm || !parseId) return;
    setError(null);
    setPhase("applying");
    try {
      const result = await aiDayPlanRepository.apply(planDate, items, parseId);
      planDrafts.clear(planDate);
      setText("");
      setItems([]);
      setParseId(null);
      setPhase("input");
      await onApplied(result);
    } catch (err) {
      setError(asDayPlanError(err));
      setPhase("preview");
    }
  }

  function updateItem(key: string, patch: Partial<EditablePlanItem>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  /** re-sort after a time edit is committed (on blur), so cards do not jump while typing */
  function resort() {
    setItems((prev) => sortByTime(prev));
  }

  function backToText() {
    setError(null);
    setPhase("input");
  }

  return {
    text,
    setText,
    phase,
    items,
    error,
    canParse,
    canConfirm,
    enabledCount: enabled.length,
    minutes,
    invalid,
    overlaps,
    parse,
    confirm,
    updateItem,
    resort,
    backToText,
    dismissError: () => setError(null),
  };
}
