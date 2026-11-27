-- Daily streak with a weekly freeze.
--
-- «День сдан» = a daily_reports row of the character for the user's date.
-- 1. apply_day_report now also leaves a daily_reports row: an AFTER UPDATE trigger on day_report_applications (the
--    apply stores its result there at the very end) inserts the report text of the parse (input_text). The client
--    still calls save_daily_report afterwards — that upsert keeps working (it overwrites the content).
-- 2. _user_today(user, now): the user's date — profiles.timezone (NULL / unknown → UTC) and day_start_time.
-- 3. _streak_info(character, now) → { current, longest, frozen_dates, today_done, broken_recently, broken_on,
--    today, week }:
--    one forward pass over ≤ 730 days up to yesterday (and today, if today is done):
--      done day → run + 1;
--      missed day inside a run → frozen if this calendar week (Mon–Sun) has no freeze in the run yet (run goes on,
--      +0), otherwise the run breaks (run = 0, the freezes of that run are forgotten);
--    current = the run at the end; frozen_dates = the frozen days of that run; longest = the max run;
--    broken_recently = current ≤ 1, the last break was ≤ 3 days ago and the run before it was ≥ 3.
--    week = 7 days Mon–Sun of the current week: done / frozen / missed / today / future.
-- 4. get_my_streak() — RPC of the caller.
-- 5. character_snapshots.streak — the current streak at the moment of the snapshot; a new report refreshes the
--    snapshot of its date (trigger on daily_reports).

-- ── 1. apply_day_report → daily_reports ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public._day_report_applied()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_character_id UUID;
    v_text         TEXT;
BEGIN
    SELECT id INTO v_character_id FROM public.characters WHERE profile_id = NEW.user_id;
    SELECT input_text INTO v_text FROM public.day_report_parses WHERE id = NEW.parse_id;
    IF v_character_id IS NULL THEN
        RETURN NEW;
    END IF;
    INSERT INTO public.daily_reports (character_id, date, content)
    VALUES (v_character_id, NEW.report_date, COALESCE(NULLIF(btrim(v_text), ''), 'Отчёт дня'))
    ON CONFLICT (character_id, date) DO NOTHING;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public._day_report_applied() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS day_report_applied ON public.day_report_applications;
CREATE TRIGGER day_report_applied
    AFTER UPDATE OF result ON public.day_report_applications
    FOR EACH ROW
    WHEN (OLD.result IS NULL AND NEW.result IS NOT NULL)
    EXECUTE FUNCTION public._day_report_applied();


-- ── 2. The user's date ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public._user_today(p_user_id UUID, p_now TIMESTAMPTZ DEFAULT now())
RETURNS DATE
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_tz    TEXT;
    v_start TIME;
    v_local TIMESTAMP;
BEGIN
    SELECT timezone, day_start_time INTO v_tz, v_start FROM public.profiles WHERE id = p_user_id;
    BEGIN
        v_local := p_now AT TIME ZONE COALESCE(v_tz, 'UTC');
    EXCEPTION WHEN OTHERS THEN
        v_local := p_now AT TIME ZONE 'UTC';
    END;
    RETURN (v_local - COALESCE(v_start, '04:00'::TIME))::DATE;
END;
$$;

REVOKE ALL ON FUNCTION public._user_today(UUID, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;


-- ── 3. Streak ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public._streak_info(p_character_id UUID, p_now TIMESTAMPTZ DEFAULT now())
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    c_window CONSTANT INT := 730;
    v_user_id     UUID;
    v_today       DATE;
    v_done        DATE[];
    v_today_done  BOOLEAN;
    v_last        DATE;
    v_day         DATE;
    v_run         INT := 0;
    v_longest     INT := 0;
    v_frozen      DATE[] := '{}';
    v_weeks       DATE[] := '{}';
    v_week        DATE;
    v_break_on    DATE;
    v_break_run   INT := 0;
    v_week_out    JSONB := '[]'::jsonb;
    v_status      TEXT;
    v_monday      DATE;
BEGIN
    SELECT profile_id INTO v_user_id FROM public.characters WHERE id = p_character_id;
    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;
    v_today := public._user_today(v_user_id, p_now);

    SELECT COALESCE(array_agg(date ORDER BY date), '{}') INTO v_done
    FROM public.daily_reports
    WHERE character_id = p_character_id AND date BETWEEN v_today - c_window AND v_today;

    v_today_done := v_today = ANY (v_done);
    v_last := CASE WHEN v_today_done THEN v_today ELSE v_today - 1 END;

    IF cardinality(v_done) > 0 THEN
        v_day := v_done[1];
        WHILE v_day <= v_last LOOP
            IF v_day = ANY (v_done) THEN
                v_run := v_run + 1;
                v_longest := GREATEST(v_longest, v_run);
            ELSIF v_run > 0 THEN
                v_week := date_trunc('week', v_day)::DATE;
                IF v_week = ANY (v_weeks) THEN
                    v_break_on := v_day;
                    v_break_run := v_run;
                    v_run := 0;
                    v_frozen := '{}';
                    v_weeks := '{}';
                ELSE
                    v_frozen := v_frozen || v_day;
                    v_weeks := v_weeks || v_week;
                END IF;
            END IF;
            v_day := v_day + 1;
        END LOOP;
    END IF;

    v_monday := date_trunc('week', v_today)::DATE;
    FOR i IN 0..6 LOOP
        v_day := v_monday + i;
        v_status := CASE
            WHEN v_day = ANY (v_done) THEN 'done'
            WHEN v_day = ANY (v_frozen) THEN 'frozen'
            WHEN v_day = v_today THEN 'today'
            WHEN v_day > v_today THEN 'future'
            ELSE 'missed'
        END;
        v_week_out := v_week_out || jsonb_build_array(jsonb_build_object('date', v_day, 'status', v_status));
    END LOOP;

    RETURN jsonb_build_object(
        'current',         v_run,
        'longest',         v_longest,
        'frozen_dates',    to_jsonb(v_frozen),
        'today_done',      v_today_done,
        'broken_recently', v_run <= 1 AND v_break_on IS NOT NULL AND v_break_on >= v_today - 3
                           AND v_break_run >= 3,
        'broken_on',       v_break_on,
        'today',           v_today,
        'week',            v_week_out
    );
END;
$$;

REVOKE ALL ON FUNCTION public._streak_info(UUID, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;


-- ── 4. RPC ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_my_streak()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN public._streak_info(public._current_character_id());
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_streak() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_streak() TO authenticated;


-- ── 5. Snapshots carry the streak ───────────────────────────────────────────
ALTER TABLE public.character_snapshots
    ADD COLUMN IF NOT EXISTS streak INTEGER NOT NULL DEFAULT 0;

-- Same as 20261127150000 + streak (the current streak at the moment of the snapshot).
CREATE OR REPLACE FUNCTION public._upsert_character_snapshot(
    p_character_id UUID,
    p_date         DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_level        INT;
    v_total_xp     INT;
    v_attributes   JSONB;
    v_top_skills   JSONB;
    v_skills_count INT;
    v_streak       INT;
BEGIN
    SELECT level, total_xp INTO v_level, v_total_xp
    FROM public.characters
    WHERE id = p_character_id;

    IF NOT FOUND OR p_date IS NULL THEN
        RETURN;
    END IF;

    SELECT jsonb_object_agg(ad.code, COALESCE(ca.value, 0)) INTO v_attributes
    FROM public.attribute_definitions ad
    LEFT JOIN public.character_attributes ca
           ON ca.attribute_id = ad.id AND ca.character_id = p_character_id;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
               'id', t.id, 'name', t.name, 'icon', t.icon, 'level', public._skill_level_for_xp(t.total_xp),
               'total_xp', t.total_xp, 'total_hours', t.total_hours)
             ORDER BY t.total_xp DESC, t.total_hours DESC, t.created_at, t.id), '[]'::jsonb)
    INTO v_top_skills
    FROM (
        SELECT cs.id, cs.name, cs.icon, cs.total_xp, cs.total_hours, cs.created_at
        FROM public.character_skills cs
        WHERE cs.character_id = p_character_id
        ORDER BY cs.total_xp DESC, cs.total_hours DESC, cs.created_at, cs.id
        LIMIT 5
    ) t;

    SELECT count(*) INTO v_skills_count
    FROM public.character_skills
    WHERE character_id = p_character_id;

    v_streak := COALESCE((public._streak_info(p_character_id)->>'current')::INT, 0);

    INSERT INTO public.character_snapshots
        (character_id, snapshot_date, level, tier, total_xp, attributes, aspect, top_skills, skills_count, streak)
    VALUES
        (p_character_id, p_date, v_level, public._snapshot_tier(v_level), v_total_xp,
         COALESCE(v_attributes, '{}'::jsonb), public._snapshot_aspect(v_attributes), v_top_skills,
         v_skills_count, v_streak)
    ON CONFLICT (character_id, snapshot_date) DO UPDATE
    SET level        = EXCLUDED.level,
        tier         = EXCLUDED.tier,
        total_xp     = EXCLUDED.total_xp,
        attributes   = EXCLUDED.attributes,
        aspect       = EXCLUDED.aspect,
        top_skills   = EXCLUDED.top_skills,
        skills_count = EXCLUDED.skills_count,
        streak       = EXCLUDED.streak,
        updated_at   = now();
END;
$$;

REVOKE ALL ON FUNCTION public._upsert_character_snapshot(UUID, DATE) FROM PUBLIC;
REVOKE ALL ON FUNCTION public._upsert_character_snapshot(UUID, DATE) FROM anon, authenticated;

-- A new report refreshes the snapshot of its date (the streak changes with it).
CREATE OR REPLACE FUNCTION public._daily_report_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    PERFORM public._upsert_character_snapshot(NEW.character_id, NEW.date);
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public._daily_report_snapshot() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS daily_report_snapshot ON public.daily_reports;
CREATE TRIGGER daily_report_snapshot
    AFTER INSERT ON public.daily_reports
    FOR EACH ROW
    EXECUTE FUNCTION public._daily_report_snapshot();
