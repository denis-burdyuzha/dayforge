import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { dailyPlanRepository } from "@/entities/daily-plan/api/dailyPlanRepository";

import { resendStalePending } from "./pendingStore";
import { UNDO_WINDOW_MS } from "./useDeferredQuestCompletion";

/** one resend per page load (StrictMode runs effects twice; a second pass would send the same ids again) */
let started = false;

/**
 * App start (ProtectedLayout, signed in with a character): completions left in localStorage by a closed or killed
 * tab, older than the undo window, are sent to complete_quest again and forgotten (complete_quest is idempotent);
 * the character, plan and calendar data are refreshed if anything got an answer.
 */
export function useResendPendingCompletions(ready: boolean): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!ready || started) return;
    started = true;
    void resendStalePending((id) => dailyPlanRepository.completeQuest(id), {
      windowMs: UNDO_WINDOW_MS,
    }).then((answered) => {
      if (answered.length === 0) return;
      void queryClient.invalidateQueries({ queryKey: ["character"] });
      void queryClient.invalidateQueries({ queryKey: ["calendar"] });
    });
  }, [ready, queryClient]);
}
