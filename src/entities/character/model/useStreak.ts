import { useQuery } from "@tanstack/react-query";

import { characterRepository } from "../api/characterRepository";
import type { Streak } from "./streakTypes";

/**
 * Under ["character", userId] on purpose: every place that invalidates the character after a report / quest
 * refreshes the streak too (prefix match).
 */
export const streakQueryKey = (userId: string) => ["character", userId, "streak"] as const;

export function useStreak(userId: string | undefined) {
  return useQuery<Streak>({
    queryKey: userId ? streakQueryKey(userId) : ["character", "__none__", "streak"],
    queryFn: () => characterRepository.getMyStreak(),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}
