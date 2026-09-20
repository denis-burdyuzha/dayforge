import { useQuery } from "@tanstack/react-query";

import { characterRepository } from "../api/characterRepository";
import type { Character } from "./characterTypes";

export const characterQueryKey = (userId: string) => ["character", userId] as const;

/**
 * Fetches the current user's character.
 * Used by both HomePage and Header — TanStack Query caches the result
 * under the same key so only one network request is made.
 */
export function useCharacter(userId: string | undefined) {
  return useQuery<Character | null>({
    queryKey: userId ? characterQueryKey(userId) : ["character", "__none__"],
    queryFn: () => characterRepository.getCurrentCharacter(userId!),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}
