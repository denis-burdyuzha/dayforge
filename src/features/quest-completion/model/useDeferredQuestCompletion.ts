import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import { dailyPlanRepository } from "@/entities/daily-plan/api/dailyPlanRepository";
import { questErrorMessage } from "@/entities/daily-plan/model/calendar";
import type { QuestCompletionResult } from "@/shared/api/supabase/rpcTypes";

import { type CompletingQuest, createDeferredCompletionController } from "./deferredCompletion";
import { addPending, isNetworkError, removePending } from "./pendingStore";

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
        removePending(quest.id); // the server answered (also «already completed»)
        options.onCompleted(quest, result);
      } catch (err) {
        // a final server error is forgotten; a lost request (offline, page closing) is sent again on the next start
        if (!isNetworkError(err)) removePending(quest.id);
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

  // the window is mirrored to localStorage, so a closed / killed tab does not lose the completion
  const complete = useCallback(
    (quest: CompletingQuest) => {
      if (controller.complete(quest))
        addPending({ id: quest.id, title: quest.title, at: Date.now() });
    },
    [controller],
  );
  const undo = useCallback(
    (id: string) => {
      if (controller.undo(id)) removePending(id);
    },
    [controller],
  );
  const undoLast = useCallback(() => {
    const id = controller.undoLast();
    if (id) removePending(id);
  }, [controller]);

  return {
    /** quests to show as completed: waiting for the end of the window or being sent */
    optimisticIds: snapshot.optimisticIds,
    pending: snapshot.pending,
    complete,
    undo,
    undoLast,
    flushAll: controller.flushAll,
  };
}
