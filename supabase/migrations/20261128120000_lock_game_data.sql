-- ============================================================
-- Migration: lock game data — the client only reads; every write goes through SECURITY DEFINER RPCs
-- ============================================================
-- Audit: docs/ai-context/security.md. Before this migration anon/authenticated had ALL on most tables and RLS let a
-- user insert/update/delete their own characters, attributes, skills, quests, plans, reports and xp_transactions —
-- bypassing credits, snapshots and the future league rules.
-- 1. Table rights: anon/authenticated lose every write right (and TRUNCATE/REFERENCES/TRIGGER/MAINTAIN); authenticated
--    keeps SELECT (rows limited by the select-own policies); anon keeps SELECT only on the reference tables
--    attribute_definitions and skills. All insert/update/delete policies are dropped, except «update own profile».
-- 2. profiles: column-level UPDATE (display_name, avatar_url) only.
-- 3. Default privileges: a new table gives anon nothing and authenticated only SELECT (enable RLS in its migration!).
-- 4. quests.planned_at (set once, never changes) and quests.scheduled_at (moves when the date/time is rescheduled).
-- 5. _find_skill_by_name (shared dedup) → _resolve_event_skill re-created on it; create_skill RPC.
-- 6. RPCs: get_or_create_daily_plan, create_quest, update_quest, delete_quest, save_daily_report.
-- 7. Function hygiene: DROP test_quest_engine; internal helpers are no longer executable by clients.


-- ── 1. Table rights + policies ──────────────────────────────────────────────
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.attribute_definitions, public.skills TO anon;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND cmd <> 'SELECT'
          AND NOT (tablename = 'profiles' AND cmd = 'UPDATE')
    LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END;
$$;


-- ── 2. profiles: only display fields ────────────────────────────────────────
-- Policy «Users can update own profile» (id = auth.uid()) stays; the column grant limits what can change.
GRANT UPDATE (display_name, avatar_url) ON public.profiles TO authenticated;


-- ── 3. New tables: read-only for the client by default ──────────────────────
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;


-- ── 4. quests: planned_at / scheduled_at ────────────────────────────────────
-- planned_at: when the quest was put into a plan — set by the server once, never changes.
-- scheduled_at: when its date/time was last set — moves on reschedule (the future league counts by it).
ALTER TABLE public.quests
    ADD COLUMN IF NOT EXISTS planned_at   TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ NULL;

UPDATE public.quests SET planned_at = created_at WHERE planned_at IS NULL;
UPDATE public.quests SET scheduled_at = planned_at WHERE scheduled_at IS NULL;

ALTER TABLE public.quests
    ALTER COLUMN planned_at   SET DEFAULT now(),
    ALTER COLUMN planned_at   SET NOT NULL,
    ALTER COLUMN scheduled_at SET DEFAULT now(),
    ALTER COLUMN scheduled_at SET NOT NULL;


-- ── 5. Skills: shared dedup + create_skill ──────────────────────────────────
-- The user's skill whose name or alias matches p_name after normalisation (oldest first), or no row.
CREATE OR REPLACE FUNCTION public._find_skill_by_name(p_character_id UUID, p_name TEXT)
RETURNS TABLE (skill_id UUID, skill_name TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT cs.id, cs.name
    FROM public.character_skills cs
    WHERE cs.character_id = p_character_id
      AND (public._normalize_skill_name(cs.name) = public._normalize_skill_name(p_name)
           OR EXISTS (SELECT 1 FROM unnest(cs.aliases) a
                      WHERE public._normalize_skill_name(a) = public._normalize_skill_name(p_name)))
    ORDER BY cs.created_at
    LIMIT 1
$$;

REVOKE ALL ON FUNCTION public._find_skill_by_name(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public._find_skill_by_name(UUID, TEXT) FROM anon, authenticated;

-- Same contract as 20261127120000; the dedup query now lives in _find_skill_by_name.
CREATE OR REPLACE FUNCTION public._resolve_event_skill(
    p_character_id UUID,
    p_skill        JSONB,
    p_invalid_code TEXT
)
RETURNS TABLE (skill_id UUID, skill_name TEXT, created BOOLEAN, codes TEXT[], icon TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_kind     TEXT;
    v_id       UUID;
    v_name     TEXT;
    v_new_name TEXT;
    v_codes    TEXT[];
    v_attr_ids UUID[];
    v_icon     TEXT;
BEGIN
    IF p_skill IS NULL OR jsonb_typeof(p_skill) <> 'object' THEN
        RAISE EXCEPTION USING MESSAGE = p_invalid_code;
    END IF;
    v_kind := p_skill->>'kind';

    IF v_kind = 'none' THEN
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, false, NULL::TEXT[], NULL::TEXT;
        RETURN;
    END IF;

    IF v_kind = 'existing' THEN
        IF (p_skill->>'skill_id') IS NULL
           OR (p_skill->>'skill_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
            RAISE EXCEPTION USING MESSAGE = 'SKILL_NOT_FOUND';
        END IF;
        SELECT cs.id, cs.name INTO v_id, v_name
        FROM public.character_skills cs
        WHERE cs.id = (p_skill->>'skill_id')::UUID
          AND cs.character_id = p_character_id;
        IF v_id IS NULL THEN
            RAISE EXCEPTION USING MESSAGE = 'SKILL_NOT_FOUND';
        END IF;
        RETURN QUERY SELECT v_id, v_name, false, NULL::TEXT[], NULL::TEXT;
        RETURN;
    END IF;

    IF v_kind IS DISTINCT FROM 'new' THEN
        RAISE EXCEPTION USING MESSAGE = p_invalid_code;
    END IF;

    v_new_name := regexp_replace(btrim(COALESCE(p_skill->>'name', '')), '\s+', ' ', 'g');
    IF v_new_name = '' OR length(v_new_name) > 60 THEN
        RAISE EXCEPTION USING MESSAGE = p_invalid_code;
    END IF;

    SELECT f.skill_id, f.skill_name INTO v_id, v_name
    FROM public._find_skill_by_name(p_character_id, v_new_name) f;

    IF v_id IS NOT NULL THEN
        RETURN QUERY SELECT v_id, v_name, false, NULL::TEXT[], NULL::TEXT;
        RETURN;
    END IF;

    IF jsonb_typeof(p_skill->'attributes') IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION USING MESSAGE = 'INVALID_SKILL_ATTRIBUTES';
    END IF;
    SELECT array_agg(DISTINCT a) INTO v_codes
    FROM jsonb_array_elements_text(p_skill->'attributes') a;
    IF v_codes IS NULL OR cardinality(v_codes) < 1 OR cardinality(v_codes) > 2
       OR jsonb_array_length(p_skill->'attributes') > 2 THEN
        RAISE EXCEPTION USING MESSAGE = 'INVALID_SKILL_ATTRIBUTES';
    END IF;
    SELECT array_agg(ad.id ORDER BY o.ord), array_agg(o.code ORDER BY o.ord) INTO v_attr_ids, v_codes
    FROM jsonb_array_elements_text(p_skill->'attributes') WITH ORDINALITY o(code, ord)
    JOIN public.attribute_definitions ad ON ad.code = o.code;
    IF v_attr_ids IS NULL OR cardinality(v_attr_ids) <> jsonb_array_length(p_skill->'attributes') THEN
        RAISE EXCEPTION USING MESSAGE = 'INVALID_SKILL_ATTRIBUTES';
    END IF;

    v_icon := p_skill->>'icon';
    IF v_icon IS NOT NULL AND v_icon !~ '^[a-z0-9_]{1,40}$' THEN
        v_icon := NULL;
    END IF;

    INSERT INTO public.character_skills
        (character_id, name, primary_attribute_id, secondary_attribute_id, icon, total_hours, total_xp)
    VALUES
        (p_character_id, v_new_name, v_attr_ids[1], v_attr_ids[2], v_icon, 0, 0)
    RETURNING character_skills.id, character_skills.name INTO v_id, v_name;

    RETURN QUERY SELECT v_id, v_name, true, v_codes, v_icon;
END;
$$;

REVOKE ALL ON FUNCTION public._resolve_event_skill(UUID, JSONB, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public._resolve_event_skill(UUID, JSONB, TEXT) FROM anon, authenticated;


-- The caller's character (row lock: serialises concurrent writes of one user). Errors: NOT_AUTHENTICATED,
-- CHARACTER_NOT_FOUND.
CREATE OR REPLACE FUNCTION public._current_character_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id      UUID := auth.uid();
    v_character_id UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'NOT_AUTHENTICATED';
    END IF;
    SELECT id INTO v_character_id
    FROM public.characters
    WHERE profile_id = v_user_id
    FOR UPDATE;
    IF v_character_id IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'CHARACTER_NOT_FOUND';
    END IF;
    RETURN v_character_id;
END;
$$;

REVOKE ALL ON FUNCTION public._current_character_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public._current_character_id() FROM anon, authenticated;


-- create_skill(p_name, p_attributes [code, code?], p_icon?) — manual skill creation.
-- Strictly 1–2 known attribute codes (else INVALID_ATTRIBUTES), name 1–60 (else INVALID_SKILL_NAME). A name that
-- matches an existing skill (normalised name or alias) returns that skill (created: false).
-- Returns { id, name, icon, created }.
CREATE OR REPLACE FUNCTION public.create_skill(
    p_name       TEXT,
    p_attributes TEXT[],
    p_icon       TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_character_id UUID := public._current_character_id();
    v_name         TEXT := regexp_replace(btrim(COALESCE(p_name, '')), '\s+', ' ', 'g');
    v_skill        RECORD;
BEGIN
    IF v_name = '' OR length(v_name) > 60 THEN
        RAISE EXCEPTION USING MESSAGE = 'INVALID_SKILL_NAME';
    END IF;
    IF p_attributes IS NULL OR cardinality(p_attributes) < 1 OR cardinality(p_attributes) > 2
       OR (SELECT count(DISTINCT a) FROM unnest(p_attributes) a) <> cardinality(p_attributes)
       OR (SELECT count(*) FROM public.attribute_definitions ad WHERE ad.code = ANY(p_attributes))
          <> cardinality(p_attributes) THEN
        RAISE EXCEPTION USING MESSAGE = 'INVALID_ATTRIBUTES';
    END IF;

    SELECT * INTO v_skill
    FROM public._resolve_event_skill(
        v_character_id,
        jsonb_build_object('kind', 'new', 'name', v_name, 'attributes', to_jsonb(p_attributes),
                           'icon', p_icon),
        'INVALID_SKILL_NAME');

    RETURN jsonb_build_object('id', v_skill.skill_id, 'name', v_skill.skill_name,
                              'icon', v_skill.icon, 'created', v_skill.created);
END;
$$;

REVOKE ALL ON FUNCTION public.create_skill(TEXT, TEXT[], TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_skill(TEXT, TEXT[], TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_skill(TEXT, TEXT[], TEXT) TO authenticated;


-- ── 6. Plans, quests, reports ───────────────────────────────────────────────
-- The plan of the caller's character for a date, created when missing. Internal (takes a character id).
CREATE OR REPLACE FUNCTION public._ensure_daily_plan(p_character_id UUID, p_date DATE)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_plan_id UUID;
BEGIN
    IF p_date IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'INVALID_DATE';
    END IF;
    INSERT INTO public.daily_plans (character_id, date)
    VALUES (p_character_id, p_date)
    ON CONFLICT (character_id, date) DO NOTHING;
    SELECT id INTO v_plan_id
    FROM public.daily_plans
    WHERE character_id = p_character_id AND date = p_date;
    RETURN v_plan_id;
END;
$$;

REVOKE ALL ON FUNCTION public._ensure_daily_plan(UUID, DATE) FROM PUBLIC;
REVOKE ALL ON FUNCTION public._ensure_daily_plan(UUID, DATE) FROM anon, authenticated;

-- get_or_create_daily_plan(p_date) → { id, character_id, date, status }
CREATE OR REPLACE FUNCTION public.get_or_create_daily_plan(p_date DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_plan_id UUID := public._ensure_daily_plan(public._current_character_id(), p_date);
BEGIN
    RETURN (SELECT jsonb_build_object('id', dp.id, 'character_id', dp.character_id, 'date', dp.date,
                                      'status', dp.status)
            FROM public.daily_plans dp WHERE dp.id = v_plan_id);
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_daily_plan(DATE) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_or_create_daily_plan(DATE) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_daily_plan(DATE) TO authenticated;

-- Shared validation of the editable quest fields. Errors: INVALID_TITLE (1–120 after trim), INVALID_DURATION (5–480).
CREATE OR REPLACE FUNCTION public._check_quest_fields(p_title TEXT, p_duration_minutes INT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
DECLARE
    v_title TEXT := btrim(COALESCE(p_title, ''));
BEGIN
    IF v_title = '' OR length(v_title) > 120 THEN
        RAISE EXCEPTION USING MESSAGE = 'INVALID_TITLE';
    END IF;
    IF p_duration_minutes IS NOT NULL AND (p_duration_minutes < 5 OR p_duration_minutes > 480) THEN
        RAISE EXCEPTION USING MESSAGE = 'INVALID_DURATION';
    END IF;
    RETURN v_title;
END;
$$;

REVOKE ALL ON FUNCTION public._check_quest_fields(TEXT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public._check_quest_fields(TEXT, INT) FROM anon, authenticated;

-- The caller's skill name, or SKILL_NOT_FOUND (NULL id → NULL name).
CREATE OR REPLACE FUNCTION public._own_skill_name(p_character_id UUID, p_skill_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_name TEXT;
BEGIN
    IF p_skill_id IS NULL THEN
        RETURN NULL;
    END IF;
    SELECT name INTO v_name
    FROM public.character_skills
    WHERE id = p_skill_id AND character_id = p_character_id;
    IF v_name IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'SKILL_NOT_FOUND';
    END IF;
    RETURN v_name;
END;
$$;

REVOKE ALL ON FUNCTION public._own_skill_name(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public._own_skill_name(UUID, UUID) FROM anon, authenticated;

-- create_quest — a pending manual quest on the date (plan created when missing). hours = duration / 60 (for the
-- skill credit on completion); planned_at = scheduled_at = now(). Returns the quest row as JSON.
CREATE OR REPLACE FUNCTION public.create_quest(
    p_date             DATE,
    p_title            TEXT,
    p_start_time       TIME DEFAULT NULL,
    p_duration_minutes INT  DEFAULT NULL,
    p_skill_id         UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_character_id UUID := public._current_character_id();
    v_title        TEXT := public._check_quest_fields(p_title, p_duration_minutes);
    v_skill_name   TEXT := public._own_skill_name(v_character_id, p_skill_id);
    v_plan_id      UUID := public._ensure_daily_plan(v_character_id, p_date);
    v_quest        public.quests;
BEGIN
    INSERT INTO public.quests (daily_plan_id, title, status, position, skill_id, skill_name, hours,
                               start_time, duration_minutes, source, planned_at, scheduled_at)
    VALUES (v_plan_id, v_title, 'pending',
            (SELECT COALESCE(max(position), 0) + 1 FROM public.quests WHERE daily_plan_id = v_plan_id),
            p_skill_id, v_skill_name, round(p_duration_minutes / 60.0, 2),
            p_start_time, p_duration_minutes, 'manual', now(), now())
    RETURNING * INTO v_quest;
    RETURN to_jsonb(v_quest);
END;
$$;

REVOKE ALL ON FUNCTION public.create_quest(DATE, TEXT, TIME, INT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_quest(DATE, TEXT, TIME, INT, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_quest(DATE, TEXT, TIME, INT, UUID) TO authenticated;

-- update_quest — sets the editable fields of the caller's quest.
-- A completed quest: only the title may change (anything else differing → QUEST_COMPLETED).
-- Another date → the quest moves to that date's plan (created when missing), to the end.
-- scheduled_at = now() when the date or start_time changes; planned_at never changes.
-- hours = duration / 60, kept as is when the duration is NULL. Errors: QUEST_NOT_FOUND (also another user's quest),
-- QUEST_COMPLETED, INVALID_TITLE, INVALID_DURATION, SKILL_NOT_FOUND, INVALID_DATE.
CREATE OR REPLACE FUNCTION public.update_quest(
    p_quest_id         UUID,
    p_title            TEXT,
    p_date             DATE,
    -- full state of the editable fields: an omitted value means NULL (no time / no duration / no skill)
    p_start_time       TIME DEFAULT NULL,
    p_duration_minutes INT  DEFAULT NULL,
    p_skill_id         UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_character_id UUID := public._current_character_id();
    v_title        TEXT;
    v_skill_name   TEXT;
    v_old          RECORD;
    v_plan_id      UUID;
    v_moved        BOOLEAN;
    v_rescheduled  BOOLEAN;
    v_quest        public.quests;
BEGIN
    SELECT q.*, dp.date AS plan_date INTO v_old
    FROM public.quests q
    JOIN public.daily_plans dp ON dp.id = q.daily_plan_id
    WHERE q.id = p_quest_id AND dp.character_id = v_character_id
    FOR UPDATE OF q;
    IF v_old.id IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'QUEST_NOT_FOUND';
    END IF;
    IF p_date IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'INVALID_DATE';
    END IF;

    v_title := public._check_quest_fields(p_title, p_duration_minutes);
    v_moved := p_date IS DISTINCT FROM v_old.plan_date;
    v_rescheduled := v_moved OR p_start_time IS DISTINCT FROM v_old.start_time;

    IF v_old.status = 'completed' THEN
        IF v_rescheduled
           OR p_duration_minutes IS DISTINCT FROM v_old.duration_minutes
           OR p_skill_id IS DISTINCT FROM v_old.skill_id THEN
            RAISE EXCEPTION USING MESSAGE = 'QUEST_COMPLETED';
        END IF;
        UPDATE public.quests SET title = v_title, updated_at = now()
        WHERE id = p_quest_id
        RETURNING * INTO v_quest;
        RETURN to_jsonb(v_quest);
    END IF;

    v_skill_name := public._own_skill_name(v_character_id, p_skill_id);
    v_plan_id := v_old.daily_plan_id;
    IF v_moved THEN
        v_plan_id := public._ensure_daily_plan(v_character_id, p_date);
    END IF;

    UPDATE public.quests
    SET title            = v_title,
        daily_plan_id    = v_plan_id,
        position         = CASE WHEN v_moved
                                THEN (SELECT COALESCE(max(position), 0) + 1 FROM public.quests
                                      WHERE daily_plan_id = v_plan_id)
                                ELSE position END,
        start_time       = p_start_time,
        duration_minutes = p_duration_minutes,
        hours            = COALESCE(round(p_duration_minutes / 60.0, 2), hours),
        skill_id         = p_skill_id,
        skill_name       = v_skill_name,
        scheduled_at     = CASE WHEN v_rescheduled THEN now() ELSE scheduled_at END,
        updated_at       = now()
    WHERE id = p_quest_id
    RETURNING * INTO v_quest;
    RETURN to_jsonb(v_quest);
END;
$$;

REVOKE ALL ON FUNCTION public.update_quest(UUID, TEXT, DATE, TIME, INT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_quest(UUID, TEXT, DATE, TIME, INT, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.update_quest(UUID, TEXT, DATE, TIME, INT, UUID) TO authenticated;

-- delete_quest — deletes the caller's pending quest. Errors: QUEST_NOT_FOUND, QUEST_COMPLETED.
CREATE OR REPLACE FUNCTION public.delete_quest(p_quest_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_character_id UUID := public._current_character_id();
    v_status       TEXT;
BEGIN
    SELECT q.status INTO v_status
    FROM public.quests q
    JOIN public.daily_plans dp ON dp.id = q.daily_plan_id
    WHERE q.id = p_quest_id AND dp.character_id = v_character_id
    FOR UPDATE OF q;
    IF v_status IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'QUEST_NOT_FOUND';
    END IF;
    IF v_status = 'completed' THEN
        RAISE EXCEPTION USING MESSAGE = 'QUEST_COMPLETED';
    END IF;
    DELETE FROM public.quests WHERE id = p_quest_id;
    RETURN jsonb_build_object('success', true, 'id', p_quest_id);
END;
$$;

REVOKE ALL ON FUNCTION public.delete_quest(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_quest(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_quest(UUID) TO authenticated;

-- save_daily_report — upsert of the caller's free-text report for the date. Error: INVALID_CONTENT (empty / > 20000).
-- Returns { id, character_id, date, content, created_at }.
CREATE OR REPLACE FUNCTION public.save_daily_report(p_date DATE, p_content TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_character_id UUID := public._current_character_id();
    v_report       public.daily_reports;
BEGIN
    IF p_date IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'INVALID_DATE';
    END IF;
    IF p_content IS NULL OR btrim(p_content) = '' OR length(p_content) > 20000 THEN
        RAISE EXCEPTION USING MESSAGE = 'INVALID_CONTENT';
    END IF;
    INSERT INTO public.daily_reports (character_id, date, content)
    VALUES (v_character_id, p_date, p_content)
    ON CONFLICT (character_id, date) DO UPDATE
    SET content = EXCLUDED.content, updated_at = now()
    RETURNING * INTO v_report;
    RETURN jsonb_build_object('id', v_report.id, 'character_id', v_report.character_id, 'date', v_report.date,
                              'content', v_report.content, 'created_at', v_report.created_at);
END;
$$;

REVOKE ALL ON FUNCTION public.save_daily_report(DATE, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_daily_report(DATE, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.save_daily_report(DATE, TEXT) TO authenticated;


-- ── 7. Function hygiene ─────────────────────────────────────────────────────
-- test_quest_engine: SECURITY DEFINER test helper (inserted/deleted skills of the first character), executable by
-- anyone, anon included.
DROP FUNCTION IF EXISTS public.test_quest_engine();

-- Internal helpers: called only from SECURITY DEFINER functions (they run as the owner) or by a trigger.
REVOKE ALL ON FUNCTION public.calculate_quest_effects(UUID, NUMERIC) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._normalize_skill_name(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._snapshot_tier(INT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._snapshot_aspect(JSONB) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._skill_level_for_xp(INT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Client RPCs: authenticated only.
REVOKE ALL ON FUNCTION public.complete_quest(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_quest(UUID) TO authenticated;
