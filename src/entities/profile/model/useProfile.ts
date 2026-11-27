import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { addDays, DEFAULT_DAY_START_TIME, getUserDayDate } from "@/shared/lib/userDay";

import { profileRepository } from "../api/profileRepository";
import type { Profile } from "./profileTypes";

export const profileQueryKey = (userId: string) => ["profile", userId] as const;

export function useProfile(userId: string | undefined) {
  return useQuery<Profile | null>({
    queryKey: userId ? profileQueryKey(userId) : ["profile", "__none__"],
    queryFn: () => profileRepository.getProfile(userId!),
    enabled: Boolean(userId),
    staleTime: 5 * 60_000,
  });
}

/** A Date that re-renders the caller every minute (and when the tab regains focus) */
function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, 60_000);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", tick);
    };
  }, []);
  return now;
}

export interface UserToday {
  /** the user's day date ("YYYY-MM-DD") by the day boundary */
  today: string;
  tomorrow: string;
  dayStartTime: string;
  now: Date;
  /** false until the profile (and so the boundary) is known */
  ready: boolean;
}

/** «Today» of the user: getUserDayDate with the profile's day boundary */
export function useUserToday(userId: string | undefined): UserToday {
  const { data: profile, isSuccess, isError } = useProfile(userId);
  const now = useNow();
  const dayStartTime = profile?.dayStartTime ?? DEFAULT_DAY_START_TIME;
  const today = getUserDayDate(now, dayStartTime);
  return { today, tomorrow: addDays(today, 1), dayStartTime, now, ready: isSuccess || isError };
}
