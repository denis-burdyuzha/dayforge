import { supabase } from "@/shared/api/supabase/client";

import {
  type AddFriendResult,
  type FriendCard,
  type FriendProfile,
  type InvitePreview,
  mapFriendCard,
  mapFriendProfile,
  mapInvitePreview,
  type MyFriendCode,
} from "../model/friendTypes";

/** Friends: everything goes through RPCs — the server picks the fields a friend may see */
export const friendsRepository = {
  async getFriends(): Promise<FriendCard[]> {
    const { data, error } = await supabase.rpc("get_friends");
    if (error) throw new Error(error.message);
    return Array.isArray(data) ? data.map(mapFriendCard) : [];
  },

  async getFriendProfile(friendUserId: string): Promise<FriendProfile> {
    const { data, error } = await supabase.rpc("get_friend_profile", {
      p_friend_user_id: friendUserId,
    });
    if (error) throw new Error(error.message);
    return mapFriendProfile(data);
  },

  async getMyFriendCode(): Promise<MyFriendCode> {
    const { data, error } = await supabase.rpc("get_my_friend_code");
    if (error) throw new Error(error.message);
    const r = (data ?? {}) as { code?: string; share_daily_summary?: boolean };
    return { code: r.code ?? "", shareDailySummary: r.share_daily_summary !== false };
  },

  async addFriendByCode(code: string): Promise<AddFriendResult> {
    const { data, error } = await supabase.rpc("add_friend_by_code", { p_code: code });
    if (error) throw new Error(error.message);
    const r = (data ?? {}) as { friend_user_id?: string; name?: string; already_friends?: boolean };
    return {
      friendUserId: r.friend_user_id ?? "",
      name: r.name ?? "",
      alreadyFriends: r.already_friends === true,
    };
  },

  async removeFriend(friendUserId: string): Promise<void> {
    const { error } = await supabase.rpc("remove_friend", { p_friend_user_id: friendUserId });
    if (error) throw new Error(error.message);
  },

  async regenerateFriendCode(): Promise<string> {
    const { data, error } = await supabase.rpc("regenerate_friend_code");
    if (error) throw new Error(error.message);
    return (data as { code: string }).code;
  },

  /** Public (anon too): the name and class of the code's owner, or null */
  async getInvitePreview(code: string): Promise<InvitePreview | null> {
    const { data, error } = await supabase.rpc("get_invite_preview", { p_code: code });
    if (error) throw new Error(error.message);
    return mapInvitePreview(data);
  },
};
