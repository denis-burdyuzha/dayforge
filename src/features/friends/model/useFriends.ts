import { useQuery } from "@tanstack/react-query";

import { friendsRepository } from "../api/friendsRepository";

/** All friends queries live under ["friends"] — one invalidation refreshes the list, profiles and the code */
export const friendsKeys = {
  all: ["friends"] as const,
  list: () => ["friends", "list"] as const,
  profile: (userId: string) => ["friends", "profile", userId] as const,
  myCode: () => ["friends", "my-code"] as const,
};

export function useFriends(enabled = true) {
  return useQuery({
    queryKey: friendsKeys.list(),
    queryFn: () => friendsRepository.getFriends(),
    enabled,
    staleTime: 30_000,
  });
}

export function useFriendProfile(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? friendsKeys.profile(userId) : ["friends", "profile", "__none__"],
    queryFn: () => friendsRepository.getFriendProfile(userId!),
    enabled: Boolean(userId),
    staleTime: 30_000,
    retry: false,
  });
}

export function useMyFriendCode(enabled = true) {
  return useQuery({
    queryKey: friendsKeys.myCode(),
    queryFn: () => friendsRepository.getMyFriendCode(),
    enabled,
    staleTime: 5 * 60_000,
  });
}
