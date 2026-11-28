import { useCallback } from "react";

import { useNotifications } from "@/shared/lib/notifications/context";

import { inviteLink } from "./friendCode";

const SHARE_TEXT = "Присоединяйся ко мне в Dayforge";

/** Share the invite link: the system share sheet (Web Share), otherwise copy it + a toast */
export function useShareInvite(code: string | undefined) {
  const { notify } = useNotifications();

  return useCallback(async () => {
    if (!code) return;
    const url = inviteLink(code);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Dayforge", text: SHARE_TEXT, url });
        return;
      } catch (err) {
        // the user closed the share sheet
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT}: ${url}`);
      notify("Ссылка скопирована", "success");
    } catch {
      notify(`Скопируй ссылку: ${url}`, "info", 8000);
    }
  }, [code, notify]);
}
