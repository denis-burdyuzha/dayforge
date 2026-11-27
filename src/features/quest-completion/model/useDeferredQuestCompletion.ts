import { useEffect, useMemo, useSyncExternalStore } from "react";

import { dailyPlanRepository } from "@/entities/daily-plan/api/dailyPlanRepository";
import { questErrorMessage } from "@/entities/daily-plan/model/calendar";
import type { QuestCompletionResult } from "@/shared/api/supabase/rpcTypes";

import { type CompletingQuest, createDeferredCompletionController } from "./deferredCompletion";

export type { CompletingQuest, PendingCompletion } from "./deferredCompletion";

/** how long a completion can be undone before complete_quest is sent */
export const UNDO_WINDOW_MS = 5000;

interface Options {
  characterId: string | undefined;
  delayMs?: number;
  /** complete_quest answered: XP toast, LevelUp, invalidation, list update */
  onCompleted: (quest: CompletingQuest, result: QuestCompletionResult) => void;
  /** complete_quest failed: the quest is back to «not completed» */
  onFailed: (quest: CompletingQuest, message: string) => void;
}

/**
 * «Выполнено» with a 5-second undo window. The quest shows as completed at once (optimistic); complete_quest is sent
 * only when the window ends. Every quest has its own window; undo cancels it without any request. Pending
 * completions are sent immediately when the tab gets hidden, on pagehide and when the page unmounts.
 */
export function useDeferredQuestCompletion(options: Options) {
  const delayMs = options.delayMs ?? UNDO_WINDOW_MS;
  const controller = useMemo(
    () => createDeferredCompletionController(async () => {}, delayMs),
    [delayMs],
  );

  // the latest callbacks, without recreating the controller (its timers must survive re-renders)
  useEffect(() => {
    controller.setSend(async (quest) => {
      try {
        const result = await dailyPlanRepository.completeQuest(quest.id, options.characterId);
        options.onCompleted(quest, result);
      } catch (err) {
        options.onFailed(quest, questErrorMessage(err));
      }
    });
  });

  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot);

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === "hidden") controller.flushAll();
    };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", controller.flushAll);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", controller.flushAll);
      controller.flushAll(); // leaving the page: nothing stays unsent
    };
  }, [controller]);

  return {
    /** quests to show as completed: waiting for the end of the window or being sent */
    optimisticIds: snapshot.optimisticIds,
    pending: snapshot.pending,
    complete: controller.complete,
    undo: controller.undo,
    undoLast: controller.undoLast,
    flushAll: controller.flushAll,
  };
}
