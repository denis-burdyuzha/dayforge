import { supabase } from "@/shared/api/supabase/client";
import { DEFAULT_DAY_START_TIME } from "@/shared/lib/userDay";

import type { Profile } from "../model/profileTypes";

/** Postgres time "04:00:00" → "04:00" */
const toHHMM = (t: string | null | undefined) => (t ? t.slice(0, 5) : DEFAULT_DAY_START_TIME);

/**
 * profiles of the signed-in user. The client may update only display_name, avatar_url, day_start_time, timezone and share_daily_summary
 * of its own row (column-level grants, see docs/ai-context/security.md).
 */
export const profileRepository = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, day_start_time, timezone, share_daily_summary")
      .eq("id", userId)
      .maybeSingle();
    if (error && error.code !== "PGRST116") throw new Error(error.message);
    if (!data) return null;
    return {
      id: data.id,
      username: data.username,
      displayName: data.display_name,
      dayStartTime: toHHMM(data.day_start_time),
      timezone: data.timezone,
      shareDailySummary: data.share_daily_summary,
    };
  },

  async updateDayStartTime(userId: string, dayStartTime: string): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ day_start_time: dayStartTime })
      .eq("id", userId);
    if (error) throw new Error(error.message);
  },

  async updateShareDailySummary(userId: string, share: boolean): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ share_daily_summary: share })
      .eq("id", userId);
    if (error) throw new Error(error.message);
  },

  async updateTimezone(userId: string, timezone: string): Promise<void> {
    const { error } = await supabase.from("profiles").update({ timezone }).eq("id", userId);
    if (error) throw new Error(error.message);
  },
};
