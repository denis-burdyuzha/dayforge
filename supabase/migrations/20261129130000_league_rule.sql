-- ============================================================
-- Migration: «planned in advance» rule for future league points (not used in any credit yet)
-- ============================================================
-- quest_counts_for_league(p_quest_id) — true when the quest was scheduled (quests.scheduled_at: set on creation,
-- moved by update_quest when the date or start time changes) early enough before it happens, in the owner's time zone
-- (profiles.timezone; NULL or unknown → 'UTC'):
--   • scheduled before the start of the quest's day by the user's day boundary (date + day_start_time) → true;
--   • with start_time: scheduled_at ≤ (date + start_time) − 1 hour;
--   • without start_time: scheduled_at ≤ date 14:00.
-- Internal: STABLE, SECURITY DEFINER, no GRANT to clients. planned_at is not used (it never changes).

CREATE OR REPLACE FUNCTION public.quest_counts_for_league(p_quest_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_q         RECORD;
    v_tz        TEXT;
    v_day_start TIMESTAMPTZ;
BEGIN
    SELECT q.scheduled_at, q.start_time, dp.date, p.timezone, p.day_start_time INTO v_q
    FROM public.quests q
    JOIN public.daily_plans dp ON dp.id = q.daily_plan_id
    JOIN public.characters c   ON c.id = dp.character_id
    JOIN public.profiles p     ON p.id = c.profile_id
    WHERE q.id = p_quest_id;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    v_tz := CASE
        WHEN v_q.timezone IS NOT NULL
             AND EXISTS (SELECT 1 FROM pg_catalog.pg_timezone_names WHERE name = v_q.timezone)
        THEN v_q.timezone
        ELSE 'UTC'
    END;

    -- timestamp (local date + local time) AT TIME ZONE tz → the absolute moment
    v_day_start := (v_q.date + v_q.day_start_time) AT TIME ZONE v_tz;
    IF v_q.scheduled_at < v_day_start THEN
        RETURN true;
    END IF;

    IF v_q.start_time IS NOT NULL THEN
        RETURN v_q.scheduled_at <= ((v_q.date + v_q.start_time) AT TIME ZONE v_tz) - INTERVAL '1 hour';
    END IF;

    RETURN v_q.scheduled_at <= (v_q.date + TIME '14:00') AT TIME ZONE v_tz;
END;
$$;

REVOKE ALL ON FUNCTION public.quest_counts_for_league(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.quest_counts_for_league(UUID) FROM anon, authenticated;
