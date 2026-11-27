-- ============================================================
-- Migration: the user's day boundary and time zone
-- ============================================================
-- profiles.day_start_time: the local time the user's day starts (00:00–06:00, step 30 min, default 04:00) — before it,
--   the local night still belongs to the previous day (plan, report, calendar, XP of the day).
-- profiles.timezone: IANA time zone of the user's device (the client updates it on app entry); NULL = unknown.
-- The client may UPDATE only these two columns of its own row (in addition to display_name, avatar_url).

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS day_start_time TIME NOT NULL DEFAULT '04:00',
    ADD COLUMN IF NOT EXISTS timezone       TEXT NULL;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_day_start_time_check
        CHECK (day_start_time BETWEEN '00:00' AND '06:00'
               AND extract(second FROM day_start_time) = 0
               AND extract(minute FROM day_start_time) IN (0, 30)),
    ADD CONSTRAINT profiles_timezone_check
        CHECK (timezone IS NULL OR (length(timezone) BETWEEN 1 AND 64));

GRANT UPDATE (day_start_time, timezone) ON public.profiles TO authenticated;
