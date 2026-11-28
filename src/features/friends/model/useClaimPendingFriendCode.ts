import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useNotifications } from "@/shared/lib/notifications/context";

import { friendsRepository } from "../api/friendsRepository";
import { clearPendingFriendCode, readPendingFriendCode } from "./friendCode";
import { friendErrorMessage, isFinalFriendError } from "./friendErrors";
import { friendsKeys } from "./useFriends";

/**
 * An invite opened before sign-up / sign-in left its code in localStorage: once the app is ready (after onboarding
 * and on every entry) add that friend, drop the code and say so. A network error keeps the code for the next entry.
 */
export function useClaimPendingFriendCode(enabled: boolean) {
  const { notify } = useNotifications();
  const queryClient = useQueryClient();
  const running = useRef(false);

  useEffect(() => {
    if (!enabled || running.current) return;
    const code = readPendingFriendCode();
    if (!code) return;
    running.current = true;

    friendsRepository
      .addFriendByCode(code)
      .then((r) => {
        clearPendingFriendCode();
        void queryClient.invalidateQueries({ queryKey: friendsKeys.all });
        notify(r.alreadyFriends ? "Уже в друзьях" : `Вы теперь друзья с ${r.name}`, "success");
      })
      .catch((err: unknown) => {
        if (isFinalFriendError(err)) clearPendingFriendCode();
        notify(`Приглашение: ${friendErrorMessage(err)}`, "error");
      })
      .finally(() => {
        running.current = false;
      });
  }, [enabled, notify, queryClient]);
}
