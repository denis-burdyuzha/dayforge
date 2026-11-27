import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { profileRepository } from "../api/profileRepository";
import { profileQueryKey, useProfile } from "./useProfile";

/** IANA zone of the device ("" when the browser does not report one) */
export function deviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

/**
 * On app entry: store the device time zone in the profile when it differs from the saved one (the server uses it for
 * the league rule). Fails silently — the zone is refreshed on the next entry.
 */
export function useTimezoneSync(userId: string | undefined): void {
  const { data: profile } = useProfile(userId);
  const queryClient = useQueryClient();
  const saved = profile?.timezone;
  const loaded = profile !== undefined && profile !== null;

  useEffect(() => {
    if (!userId || !loaded) return;
    const zone = deviceTimezone();
    if (!zone || zone === saved) return;
    profileRepository
      .updateTimezone(userId, zone)
      .then(() => queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) }))
      .catch(() => {});
  }, [userId, loaded, saved, queryClient]);
}
