-- ============================================================
-- Migration: AI day plan — quest time fields, plan parse log, apply_day_plan RPC
-- ============================================================
-- 1. quests: start_time, duration_minutes, source (manual | ai_plan | ai_report)
-- 2. _complete_quest_core: a quest without a skill completes with 0 XP and no attribute change
-- 3. _resolve_event_skill: the skill resolution shared by apply_day_report and apply_day_plan
--    (existing → ownership check; new → dedup by normalised name / aliases, else create; none)
-- 4. apply_day_report re-created on _resolve_event_skill (same result); created quests get source 'ai_report'
-- 5. usage jsonb on day_report_parses; day_plan_parses + day_plan_applications
-- 6. apply_day_plan(p_plan_date, p_items, p_parse_id)
-- New entities are granted explicitly (new Supabase projects do not auto-expose them).


-- ── 1. quests: time fields + source ─────────────────────────────────────────
ALTER TABLE public.quests
    ADD COLUMN IF NOT EXISTS start_time       TIME NULL,
    ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NULL,
    ADD COLUMN IF NOT EXISTS source           TEXT NOT NULL DEFAULT 'manual';

ALTER TABLE public.quests
    ADD CONSTRAINT quests_duration_minutes_check
        CHECK (duration_minutes IS NULL OR duration_minutes BETWEEN 5 AND 480),
    ADD CONSTRAINT quests_source_check
        CHECK (source IN ('manual', 'ai_plan', 'ai_report'));


-- ── 2. Completion core: no skill → 0 XP ─────────────────────────────────────
-- Same as 20261126120000 except: when p_skill_id IS NULL the quest is completed but nothing is credited
-- (no XP, no xp_transactions row, no attributes). Callers own auth, ownership and idempotency checks.
CREATE OR REPLACE FUNCTION public._complete_quest_core(
    p_character_id UUID,
    p_quest_id     UUID,
    p_skill_id     UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    c_base_xp_multiplier        CONSTANT INT := 10;
    c_skill_base_xp_multiplier  CONSTANT INT := 10;

    v_title             TEXT;
    v_hours             NUMERIC;
    v_old_total_xp      INT;
    v_old_level         INT;
    v_new_total_xp      INT;
    v_new_level         INT;
    v_lvl               INT;
    v_threshold         INT;
    v_next_threshold    INT;

    v_effects           JSONB;
    v_character_xp_gain INT := 0;
    v_skill_xp_gain     INT := 0;
    v_attr_changes      JSONB := '[]'::jsonb;
    v_attr_elem         JSONB;
    v_attr_id           UUID;
    v_attr_amount       INT;
    v_attrs_updated_cnt INT := 0;

    v_skill_old_xp      INT;
    v_skill_new_xp      INT;
    v_skill_level       INT := 0;
BEGIN
    SELECT title, hours INTO v_title, v_hours
    FROM public.quests
    WHERE id = p_quest_id;

    SELECT total_xp, level INTO v_old_total_xp, v_old_level
    FROM public.characters
    WHERE id = p_character_id;

    -- 1. Mark quest completed
    UPDATE public.quests
    SET status = 'completed'
    WHERE id = p_quest_id;

    -- 2. ONE call to the calculate_quest_effects engine — only for a quest with a skill
    IF p_skill_id IS NOT NULL THEN
        v_effects := public.calculate_quest_effects(p_skill_id, v_hours);

        v_character_xp_gain := COALESCE((v_effects->>'characterXp')::INT, 10);
        v_skill_xp_gain     := COALESCE((v_effects->>'skillXp')::INT, 0);
        v_attr_changes      := COALESCE(v_effects->'attributeChanges', '[]'::jsonb);
    END IF;

    -- 3. Character XP & level
    v_new_total_xp := v_old_total_xp + v_character_xp_gain;
    v_new_level    := 1;
    v_lvl          := 2;
    LOOP
        v_threshold := c_base_xp_multiplier * v_lvl * (v_lvl - 1);
        IF v_threshold <= v_new_total_xp THEN
            v_new_level := v_lvl;
            v_lvl       := v_lvl + 1;
        ELSE
            EXIT;
        END IF;
    END LOOP;
    v_next_threshold := c_base_xp_multiplier * (v_new_level + 1) * v_new_level;

    IF v_character_xp_gain > 0 THEN
        INSERT INTO public.xp_transactions (character_id, amount, reason)
        VALUES (p_character_id, v_character_xp_gain, 'Квест выполнен: ' || v_title);

        UPDATE public.characters
        SET total_xp = v_new_total_xp,
            level    = v_new_level
        WHERE id = p_character_id;
    END IF;

    -- 4. Attribute updates
    FOR v_attr_elem IN SELECT * FROM jsonb_array_elements(v_attr_changes)
    LOOP
        v_attr_id     := (v_attr_elem->>'attributeId')::UUID;
        v_attr_amount := COALESCE((v_attr_elem->>'amount')::INT, 1);

        IF v_attr_id IS NOT NULL THEN
            UPDATE public.character_attributes
            SET value = value + v_attr_amount
            WHERE character_id = p_character_id
              AND attribute_id = v_attr_id;

            v_attrs_updated_cnt := v_attrs_updated_cnt + 1;
        END IF;
    END LOOP;

    -- 5. Skill progression
    IF p_skill_id IS NOT NULL THEN
        SELECT total_xp INTO v_skill_old_xp
        FROM public.character_skills
        WHERE id = p_skill_id;

        v_skill_new_xp := COALESCE(v_skill_old_xp, 0) + v_skill_xp_gain;

        v_skill_level := 1;
        v_lvl         := 2;
        LOOP
            v_threshold := c_skill_base_xp_multiplier * v_lvl * (v_lvl - 1);
            IF v_threshold <= v_skill_new_xp THEN
                v_skill_level := v_lvl;
                v_lvl         := v_lvl + 1;
            ELSE
                EXIT;
            END IF;
        END LOOP;

        UPDATE public.character_skills
        SET total_hours       = total_hours + COALESCE(v_hours, 0),
            total_xp          = v_skill_new_xp,
            last_practiced_at = now()
        WHERE id = p_skill_id;
    END IF;

    RETURN jsonb_build_object(
        'success',            true,
        'xpAwarded',          v_character_xp_gain,
        'oldLevel',           v_old_level,
        'newLevel',           v_new_level,
        'nextLevelThreshold', v_next_threshold,
        'attributeGained',    v_attrs_updated_cnt,
        'skillXpGained',      v_skill_xp_gain,
        'skillLevel',         v_skill_level
    );
END;
$$;

REVOKE ALL ON FUNCTION public._complete_quest_core(UUID, UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public._complete_quest_core(UUID, UUID, UUID) FROM anon, authenticated;


-- ── 3. Shared skill resolution ──────────────────────────────────────────────
-- p_skill: { kind: 'existing', skill_id } | { kind: 'new', name, attributes: [code, code?], icon? } | { kind: 'none' }
-- Returns one row: skill_id / skill_name (NULL for none), created (a new row was inserted), codes / icon of the
-- created skill. Errors: SKILL_NOT_FOUND (existing skill of another user / unknown), INVALID_SKILL_ATTRIBUTES,
-- p_invalid_code (bad shape / name — each caller keeps its own code).
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

    -- dedup: normalised name vs names and aliases of the user's skills
    SELECT cs.id, cs.name INTO v_id, v_name
    FROM public.character_skills cs
    WHERE cs.character_id = p_character_id
      AND (public._normalize_skill_name(cs.name) = public._normalize_skill_name(v_new_name)
           OR EXISTS (SELECT 1 FROM unnest(cs.aliases) a
                      WHERE public._normalize_skill_name(a) = public._normalize_skill_name(v_new_name)))
    ORDER BY cs.created_at
    LIMIT 1;

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
    -- keep the order the attributes were given in (primary first)
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


-- ── 4. apply_day_report on the shared skill resolution ──────────────────────
-- Same contract and result as 20261126120000. Changes: skill via _resolve_event_skill; quests it creates get
-- source 'ai_report'; events without a skill give 0 XP (core change above).
CREATE OR REPLACE FUNCTION public.apply_day_report(
    p_report_date DATE,
    p_events      JSONB,
    p_parse_id    UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    c_min_event_hours   CONSTANT NUMERIC := 0.1;
    c_max_event_hours   CONSTANT NUMERIC := 8;
    c_max_day_hours     CONSTANT NUMERIC := 16;
    c_max_events        CONSTANT INT     := 30;
    c_base_xp_multiplier CONSTANT INT    := 10;

    v_user_id          UUID;
    v_character_id     UUID;
    v_old_level        INT;
    v_new_level        INT;
    v_parse            RECORD;
    v_claimed          UUID;
    v_existing         RECORD;
    v_plan_id          UUID;
    v_next_position    INT;

    v_event            JSONB;
    v_hours            NUMERIC;
    v_description      TEXT;
    v_planned_id       UUID;
    v_quest            RECORD;
    v_quest_id         UUID;
    v_skill            RECORD;
    v_skill_id         UUID;
    v_skill_name       TEXT;
    v_core             JSONB;

    v_already_hours    NUMERIC;
    v_new_hours        NUMERIC := 0;

    v_events_out       JSONB := '[]'::jsonb;
    v_new_skills       JSONB := '[]'::jsonb;
    v_xp_total         INT := 0;
    v_attr_total       INT := 0;
    v_skill_xp_total   INT := 0;
    v_skill_level_max  INT := 0;
    v_result           JSONB;
BEGIN
    -- 1. Auth + character (row lock serialises concurrent applies of the same user)
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'NOT_AUTHENTICATED';
    END IF;

    SELECT id, level INTO v_character_id, v_old_level
    FROM public.characters
    WHERE profile_id = v_user_id
    FOR UPDATE;

    IF v_character_id IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'CHARACTER_NOT_FOUND';
    END IF;

    -- 2. The parse must be the user's own successful parse for this date
    SELECT id, user_id, report_date, status INTO v_parse
    FROM public.day_report_parses
    WHERE id = p_parse_id;

    IF v_parse.id IS NULL OR v_parse.user_id <> v_user_id OR v_parse.status <> 'ok'
       OR v_parse.report_date <> p_report_date THEN
        RAISE EXCEPTION USING MESSAGE = 'PARSE_NOT_FOUND';
    END IF;

    -- 3. Idempotency: claim the parse; a repeat gets the stored result back
    INSERT INTO public.day_report_applications (parse_id, user_id, report_date)
    VALUES (p_parse_id, v_user_id, p_report_date)
    ON CONFLICT (parse_id) DO NOTHING
    RETURNING parse_id INTO v_claimed;

    IF v_claimed IS NULL THEN
        SELECT user_id, result INTO v_existing
        FROM public.day_report_applications
        WHERE parse_id = p_parse_id;
        IF v_existing.user_id <> v_user_id OR v_existing.result IS NULL THEN
            RAISE EXCEPTION USING MESSAGE = 'PARSE_NOT_FOUND';
        END IF;
        RETURN v_existing.result || jsonb_build_object('replayed', true);
    END IF;

    -- 4. Validate the events (shape + per-event hours) and count the hours this apply adds
    IF p_events IS NULL OR jsonb_typeof(p_events) <> 'array'
       OR jsonb_array_length(p_events) > c_max_events THEN
        RAISE EXCEPTION USING MESSAGE = 'INVALID_EVENTS';
    END IF;

    SELECT id INTO v_plan_id
    FROM public.daily_plans
    WHERE character_id = v_character_id AND date = p_report_date;

    FOR v_event IN SELECT * FROM jsonb_array_elements(p_events)
    LOOP
        IF jsonb_typeof(v_event) <> 'object' OR jsonb_typeof(v_event->'hours') <> 'number'
           OR jsonb_typeof(v_event->'skill') <> 'object' THEN
            RAISE EXCEPTION USING MESSAGE = 'INVALID_EVENTS';
        END IF;
        v_hours := (v_event->>'hours')::NUMERIC;
        IF v_hours < c_min_event_hours OR v_hours > c_max_event_hours THEN
            RAISE EXCEPTION USING MESSAGE = 'INVALID_HOURS',
                DETAIL = jsonb_build_object('hours', v_hours, 'min', c_min_event_hours,
                                            'max', c_max_event_hours)::TEXT;
        END IF;

        v_planned_id := NULLIF(v_event->>'planned_quest_id', '')::UUID;
        IF v_planned_id IS NULL OR NOT EXISTS (
            SELECT 1 FROM public.quests WHERE id = v_planned_id AND status = 'completed'
        ) THEN
            v_new_hours := v_new_hours + v_hours;
        END IF;
    END LOOP;

    -- 5. Day limit: hours already credited for the date + this apply ≤ 16
    SELECT COALESCE(sum(COALESCE(q.hours, 0)), 0) INTO v_already_hours
    FROM public.quests q
    WHERE q.daily_plan_id = v_plan_id AND q.status = 'completed';

    IF v_already_hours + v_new_hours > c_max_day_hours THEN
        RAISE EXCEPTION USING MESSAGE = 'DAY_HOURS_LIMIT',
            DETAIL = jsonb_build_object('alreadyHours', v_already_hours, 'newHours', v_new_hours,
                                        'totalHours', v_already_hours + v_new_hours,
                                        'limit', c_max_day_hours)::TEXT;
    END IF;

    -- 6. Day plan (created if the user had none for the date)
    IF v_plan_id IS NULL THEN
        INSERT INTO public.daily_plans (character_id, date)
        VALUES (v_character_id, p_report_date)
        ON CONFLICT (character_id, date) DO NOTHING;
        SELECT id INTO v_plan_id
        FROM public.daily_plans
        WHERE character_id = v_character_id AND date = p_report_date;
    END IF;

    SELECT COALESCE(max(position), -1) + 1 INTO v_next_position
    FROM public.quests WHERE daily_plan_id = v_plan_id;

    -- 7. Apply every event
    FOR v_event IN SELECT * FROM jsonb_array_elements(p_events)
    LOOP
        v_hours         := round((v_event->>'hours')::NUMERIC, 2);
        v_description   := left(btrim(COALESCE(v_event->>'description', '')), 200);
        IF v_description = '' THEN
            v_description := 'Событие дня';
        END IF;
        v_planned_id    := NULLIF(v_event->>'planned_quest_id', '')::UUID;

        -- 7a. Skill (shared resolution)
        SELECT * INTO v_skill
        FROM public._resolve_event_skill(v_character_id, v_event->'skill', 'INVALID_EVENTS');
        v_skill_id   := v_skill.skill_id;
        v_skill_name := v_skill.skill_name;
        IF v_skill.created THEN
            v_new_skills := v_new_skills || jsonb_build_array(jsonb_build_object(
                'id', v_skill.skill_id, 'name', v_skill.skill_name, 'icon', v_skill.icon,
                'attributes', to_jsonb(v_skill.codes)));
        END IF;

        -- 7b. Quest: the planned one, or a new quest on the date
        IF v_planned_id IS NOT NULL THEN
            SELECT q.id, q.status INTO v_quest
            FROM public.quests q
            WHERE q.id = v_planned_id AND q.daily_plan_id = v_plan_id;
            IF v_quest.id IS NULL THEN
                RAISE EXCEPTION USING MESSAGE = 'QUEST_NOT_FOUND';
            END IF;

            IF v_quest.status = 'completed' THEN
                v_events_out := v_events_out || jsonb_build_array(jsonb_build_object(
                    'questId', v_planned_id, 'title', v_description, 'hours', v_hours,
                    'skillId', v_skill_id, 'skillName', v_skill_name, 'createdSkill', v_skill.created,
                    'plannedQuest', true, 'skipped', 'QUEST_ALREADY_COMPLETED',
                    'xpAwarded', 0, 'skillXpGained', 0, 'skillLevel', 0, 'attributeGained', 0));
                CONTINUE;
            END IF;

            UPDATE public.quests
            SET hours      = v_hours,
                skill_id   = COALESCE(v_skill_id, skill_id),
                skill_name = COALESCE(v_skill_name, skill_name)
            WHERE id = v_planned_id
            RETURNING skill_id, skill_name INTO v_skill_id, v_skill_name;
            v_quest_id := v_planned_id;
        ELSE
            INSERT INTO public.quests (daily_plan_id, title, description, status, position, hours,
                                       skill_id, skill_name, source)
            VALUES (v_plan_id, v_description, v_event->>'description', 'pending', v_next_position, v_hours,
                    v_skill_id, v_skill_name, 'ai_report')
            RETURNING id INTO v_quest_id;
            v_next_position := v_next_position + 1;
        END IF;

        -- 7c. Completion — the same core as complete_quest (XP only from calculate_quest_effects)
        v_core := public._complete_quest_core(v_character_id, v_quest_id, v_skill_id);

        v_xp_total        := v_xp_total + (v_core->>'xpAwarded')::INT;
        v_attr_total      := v_attr_total + (v_core->>'attributeGained')::INT;
        v_skill_xp_total  := v_skill_xp_total + (v_core->>'skillXpGained')::INT;
        v_skill_level_max := GREATEST(v_skill_level_max, (v_core->>'skillLevel')::INT);

        v_events_out := v_events_out || jsonb_build_array(jsonb_build_object(
            'questId', v_quest_id, 'title', v_description, 'hours', v_hours,
            'skillId', v_skill_id, 'skillName', v_skill_name, 'createdSkill', v_skill.created,
            'plannedQuest', v_planned_id IS NOT NULL,
            'xpAwarded', v_core->'xpAwarded', 'skillXpGained', v_core->'skillXpGained',
            'skillLevel', v_core->'skillLevel', 'attributeGained', v_core->'attributeGained'));
    END LOOP;

    -- 8. Summary in the complete_quest result format + events and new skills
    SELECT level INTO v_new_level FROM public.characters WHERE id = v_character_id;

    v_result := jsonb_build_object(
        'success',            true,
        'xpAwarded',          v_xp_total,
        'oldLevel',           v_old_level,
        'newLevel',           v_new_level,
        'nextLevelThreshold', c_base_xp_multiplier * (v_new_level + 1) * v_new_level,
        'attributeGained',    v_attr_total,
        'skillXpGained',      v_skill_xp_total,
        'skillLevel',         v_skill_level_max,
        'leveledUp',          v_new_level > v_old_level,
        'reportDate',         p_report_date,
        'totalHours',         v_already_hours + v_new_hours,
        'events',             v_events_out,
        'newSkills',          v_new_skills
    );

    UPDATE public.day_report_applications SET result = v_result WHERE parse_id = p_parse_id;

    RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_day_report(DATE, JSONB, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_day_report(DATE, JSONB, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.apply_day_report(DATE, JSONB, UUID) TO authenticated;


-- ── 5a. usage on the report parse log ───────────────────────────────────────
-- Token usage of the model call (input/output/cache read/cache creation) — for cost and cache checks.
ALTER TABLE public.day_report_parses
    ADD COLUMN IF NOT EXISTS usage JSONB NULL;


-- ── 5b. day_plan_parses ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.day_plan_parses (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_date     DATE NOT NULL,
    input_text    TEXT NOT NULL,
    model         TEXT NOT NULL,
    -- 1 = first try of a parse request, 2 = its retry. The daily limit counts requests (attempt = 1).
    attempt       SMALLINT NOT NULL DEFAULT 1,
    raw_output    JSONB NULL,
    parsed_items  JSONB NULL,
    status        TEXT NOT NULL,
    error_message TEXT NULL,
    latency_ms    INTEGER NULL,
    usage         JSONB NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT day_plan_parses_status_check
        CHECK (status IN ('ok', 'invalid_output', 'timeout', 'error')),
    CONSTRAINT day_plan_parses_attempt_check
        CHECK (attempt IN (1, 2))
);

CREATE INDEX IF NOT EXISTS day_plan_parses_user_created_idx
    ON public.day_plan_parses (user_id, created_at DESC);

ALTER TABLE public.day_plan_parses ENABLE ROW LEVEL SECURITY;

-- Users read only their own rows. Only the service role (bypasses RLS) writes.
CREATE POLICY "day_plan_parses: select own"
    ON public.day_plan_parses
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

REVOKE ALL ON public.day_plan_parses FROM anon, authenticated;
GRANT SELECT ON public.day_plan_parses TO authenticated;
GRANT ALL ON public.day_plan_parses TO service_role;


-- ── 5c. day_plan_applications (idempotency of apply_day_plan) ───────────────
CREATE TABLE IF NOT EXISTS public.day_plan_applications (
    parse_id     UUID PRIMARY KEY REFERENCES public.day_plan_parses(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_date    DATE NOT NULL,
    result       JSONB NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.day_plan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "day_plan_applications: select own"
    ON public.day_plan_applications
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

REVOKE ALL ON public.day_plan_applications FROM anon, authenticated;
GRANT SELECT ON public.day_plan_applications TO authenticated;
GRANT ALL ON public.day_plan_applications TO service_role;


-- ── 6. apply_day_plan ───────────────────────────────────────────────────────
-- p_items: [{ title, start_time: 'HH:MM' | null, duration_minutes,
--             skill: { kind: 'existing', skill_id } | { kind: 'new', name, attributes: [code, code?], icon? }
--                    | { kind: 'none' } }]
-- Creates a pending quest per item on the date (source 'ai_plan', hours = duration / 60). Time overlaps are allowed.
-- Errors (RAISE … USING MESSAGE = <code>, DETAIL = json): NOT_AUTHENTICATED, CHARACTER_NOT_FOUND, PARSE_NOT_FOUND,
-- INVALID_ITEMS, INVALID_DURATION, PLAN_HOURS_LIMIT, SKILL_NOT_FOUND, INVALID_SKILL_ATTRIBUTES.
-- Any error → nothing is written.
CREATE OR REPLACE FUNCTION public.apply_day_plan(
    p_plan_date DATE,
    p_items     JSONB,
    p_parse_id  UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    c_min_duration   CONSTANT INT := 5;
    c_max_duration   CONSTANT INT := 480;
    c_max_plan_min   CONSTANT INT := 960;
    c_max_items      CONSTANT INT := 30;

    v_user_id        UUID;
    v_character_id   UUID;
    v_parse          RECORD;
    v_claimed        UUID;
    v_existing       RECORD;
    v_plan_id        UUID;
    v_next_position  INT;

    v_item           JSONB;
    v_title          TEXT;
    v_start_text     TEXT;
    v_start          TIME;
    v_duration       INT;
    v_skill          RECORD;
    v_quest_id       UUID;

    v_existing_min   INT;
    v_new_min        INT := 0;

    v_quests_out     JSONB := '[]'::jsonb;
    v_new_skills     JSONB := '[]'::jsonb;
    v_result         JSONB;
BEGIN
    -- 1. Auth + character (row lock serialises concurrent applies of the same user)
    v_user_id := auth.uid();
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

    -- 2. The parse must be the user's own successful plan parse for this date
    SELECT id, user_id, plan_date, status INTO v_parse
    FROM public.day_plan_parses
    WHERE id = p_parse_id;

    IF v_parse.id IS NULL OR v_parse.user_id <> v_user_id OR v_parse.status <> 'ok'
       OR v_parse.plan_date <> p_plan_date THEN
        RAISE EXCEPTION USING MESSAGE = 'PARSE_NOT_FOUND';
    END IF;

    -- 3. Idempotency: claim the parse; a repeat (even a concurrent one) gets the stored result back
    INSERT INTO public.day_plan_applications (parse_id, user_id, plan_date)
    VALUES (p_parse_id, v_user_id, p_plan_date)
    ON CONFLICT (parse_id) DO NOTHING
    RETURNING parse_id INTO v_claimed;

    IF v_claimed IS NULL THEN
        SELECT user_id, result INTO v_existing
        FROM public.day_plan_applications
        WHERE parse_id = p_parse_id;
        IF v_existing.user_id <> v_user_id OR v_existing.result IS NULL THEN
            RAISE EXCEPTION USING MESSAGE = 'PARSE_NOT_FOUND';
        END IF;
        RETURN v_existing.result || jsonb_build_object('replayed', true);
    END IF;

    -- 4. Validate the items and count the minutes they add
    IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array'
       OR jsonb_array_length(p_items) < 1 OR jsonb_array_length(p_items) > c_max_items THEN
        RAISE EXCEPTION USING MESSAGE = 'INVALID_ITEMS';
    END IF;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        IF jsonb_typeof(v_item) <> 'object' OR jsonb_typeof(v_item->'skill') <> 'object'
           OR jsonb_typeof(v_item->'title') <> 'string'
           OR btrim(v_item->>'title') = '' OR length(btrim(v_item->>'title')) > 120 THEN
            RAISE EXCEPTION USING MESSAGE = 'INVALID_ITEMS';
        END IF;
        v_start_text := v_item->>'start_time';
        IF v_start_text IS NOT NULL AND v_start_text !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN
            RAISE EXCEPTION USING MESSAGE = 'INVALID_ITEMS';
        END IF;
        IF jsonb_typeof(v_item->'duration_minutes') IS DISTINCT FROM 'number'
           OR (v_item->>'duration_minutes')::NUMERIC <> trunc((v_item->>'duration_minutes')::NUMERIC) THEN
            RAISE EXCEPTION USING MESSAGE = 'INVALID_DURATION';
        END IF;
        v_duration := (v_item->>'duration_minutes')::INT;
        IF v_duration < c_min_duration OR v_duration > c_max_duration THEN
            RAISE EXCEPTION USING MESSAGE = 'INVALID_DURATION',
                DETAIL = jsonb_build_object('durationMinutes', v_duration, 'min', c_min_duration,
                                            'max', c_max_duration)::TEXT;
        END IF;
        v_new_min := v_new_min + v_duration;
    END LOOP;

    -- 5. Plan limit: pending quests of the date + this apply ≤ 960 minutes
    SELECT id INTO v_plan_id
    FROM public.daily_plans
    WHERE character_id = v_character_id AND date = p_plan_date;

    SELECT COALESCE(sum(COALESCE(q.duration_minutes, round(q.hours * 60)::INT, 0)), 0)::INT
    INTO v_existing_min
    FROM public.quests q
    WHERE q.daily_plan_id = v_plan_id AND q.status = 'pending';

    IF v_existing_min + v_new_min > c_max_plan_min THEN
        RAISE EXCEPTION USING MESSAGE = 'PLAN_HOURS_LIMIT',
            DETAIL = jsonb_build_object('existingMinutes', v_existing_min, 'newMinutes', v_new_min,
                                        'totalMinutes', v_existing_min + v_new_min,
                                        'limit', c_max_plan_min)::TEXT;
    END IF;

    -- 6. Day plan (created if the user had none for the date)
    IF v_plan_id IS NULL THEN
        INSERT INTO public.daily_plans (character_id, date)
        VALUES (v_character_id, p_plan_date)
        ON CONFLICT (character_id, date) DO NOTHING;
        SELECT id INTO v_plan_id
        FROM public.daily_plans
        WHERE character_id = v_character_id AND date = p_plan_date;
    END IF;

    SELECT COALESCE(max(position), -1) + 1 INTO v_next_position
    FROM public.quests WHERE daily_plan_id = v_plan_id;

    -- 7. Create the quests in time order (items without a time last, then in the given order)
    FOR v_item IN
        SELECT e.value
        FROM jsonb_array_elements(p_items) WITH ORDINALITY e(value, ord)
        ORDER BY (e.value->>'start_time') IS NULL, (e.value->>'start_time'), e.ord
    LOOP
        v_title    := btrim(v_item->>'title');
        v_start    := (v_item->>'start_time')::TIME;
        v_duration := (v_item->>'duration_minutes')::INT;

        SELECT * INTO v_skill
        FROM public._resolve_event_skill(v_character_id, v_item->'skill', 'INVALID_ITEMS');
        IF v_skill.created THEN
            v_new_skills := v_new_skills || jsonb_build_array(jsonb_build_object(
                'id', v_skill.skill_id, 'name', v_skill.skill_name, 'icon', v_skill.icon,
                'attributes', to_jsonb(v_skill.codes)));
        END IF;

        INSERT INTO public.quests (daily_plan_id, title, status, position, hours, skill_id, skill_name,
                                   start_time, duration_minutes, source)
        VALUES (v_plan_id, v_title, 'pending', v_next_position, round(v_duration / 60.0, 2),
                v_skill.skill_id, v_skill.skill_name, v_start, v_duration, 'ai_plan')
        RETURNING id INTO v_quest_id;
        v_next_position := v_next_position + 1;

        v_quests_out := v_quests_out || jsonb_build_array(jsonb_build_object(
            'id', v_quest_id, 'title', v_title, 'startTime', to_char(v_start, 'HH24:MI'),
            'durationMinutes', v_duration, 'skillId', v_skill.skill_id, 'skillName', v_skill.skill_name,
            'createdSkill', v_skill.created));
    END LOOP;

    v_result := jsonb_build_object(
        'success',      true,
        'planId',       v_plan_id,
        'planDate',     p_plan_date,
        'quests',       v_quests_out,
        'newSkills',    v_new_skills,
        'totalMinutes', v_existing_min + v_new_min
    );

    UPDATE public.day_plan_applications SET result = v_result WHERE parse_id = p_parse_id;

    RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_day_plan(DATE, JSONB, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_day_plan(DATE, JSONB, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.apply_day_plan(DATE, JSONB, UUID) TO authenticated;
