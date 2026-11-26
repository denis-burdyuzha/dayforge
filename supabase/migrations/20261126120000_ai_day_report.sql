-- ============================================================
-- Migration: AI day report — skill aliases/icon, parse log, apply_day_report RPC
-- ============================================================
-- 1. character_skills: aliases text[] + icon text
-- 2. day_report_parses: log of every AI parse attempt (written by the Edge Function with the service role)
--    + day_report_applications: result of the first apply per parse (idempotency of apply_day_report)
-- 3. _complete_quest_core: the completion logic shared by complete_quest and apply_day_report
--    (complete_quest keeps its signature and its result exactly)
-- 4. apply_day_report(p_report_date, p_events, p_parse_id)
-- New entities are granted explicitly (new Supabase projects do not auto-expose them).


-- ── 1. character_skills: aliases + icon ─────────────────────────────────────
ALTER TABLE public.character_skills
    ADD COLUMN IF NOT EXISTS aliases TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS icon TEXT NULL;


-- ── 2a. day_report_parses ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.day_report_parses (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_date   DATE NOT NULL,
    input_text    TEXT NOT NULL,
    model         TEXT NOT NULL,
    -- 1 = first try of a parse request, 2 = its retry. The daily limit counts requests (attempt = 1).
    attempt       SMALLINT NOT NULL DEFAULT 1,
    raw_output    JSONB NULL,
    parsed_events JSONB NULL,
    status        TEXT NOT NULL,
    error_message TEXT NULL,
    latency_ms    INTEGER NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT day_report_parses_status_check
        CHECK (status IN ('ok', 'invalid_output', 'timeout', 'error')),
    CONSTRAINT day_report_parses_attempt_check
        CHECK (attempt IN (1, 2))
);

CREATE INDEX IF NOT EXISTS day_report_parses_user_created_idx
    ON public.day_report_parses (user_id, created_at DESC);

ALTER TABLE public.day_report_parses ENABLE ROW LEVEL SECURITY;

-- Users read only their own rows. No insert/update/delete policy: only the service role (bypasses RLS) writes.
CREATE POLICY "day_report_parses: select own"
    ON public.day_report_parses
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

REVOKE ALL ON public.day_report_parses FROM anon, authenticated;
GRANT SELECT ON public.day_report_parses TO authenticated;
GRANT ALL ON public.day_report_parses TO service_role;


-- ── 2b. day_report_applications (idempotency of apply_day_report) ───────────
CREATE TABLE IF NOT EXISTS public.day_report_applications (
    parse_id     UUID PRIMARY KEY REFERENCES public.day_report_parses(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_date  DATE NOT NULL,
    result       JSONB NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.day_report_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "day_report_applications: select own"
    ON public.day_report_applications
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

REVOKE ALL ON public.day_report_applications FROM anon, authenticated;
GRANT SELECT ON public.day_report_applications TO authenticated;
GRANT ALL ON public.day_report_applications TO service_role;


-- ── 3a. Skill name normalisation (lower, trim, collapse whitespace) ─────────
CREATE OR REPLACE FUNCTION public._normalize_skill_name(p_name TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT lower(regexp_replace(btrim(coalesce(p_name, '')), '\s+', ' ', 'g'))
$$;


-- ── 3b. Shared completion core ──────────────────────────────────────────────
-- Completes quest p_quest_id of character p_character_id with skill p_skill_id (may be NULL):
-- quest → completed, ONE calculate_quest_effects call, character XP + level, xp_transactions,
-- attribute +N, skill XP/hours/level. Callers own auth, ownership and idempotency checks.
-- Not exposed to API roles.
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
    v_character_xp_gain INT;
    v_skill_xp_gain     INT;
    v_attr_changes      JSONB;
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

    -- 2. ONE call to the calculate_quest_effects engine
    v_effects := public.calculate_quest_effects(p_skill_id, v_hours);

    v_character_xp_gain := COALESCE((v_effects->>'characterXp')::INT, 10);
    v_skill_xp_gain     := COALESCE((v_effects->>'skillXp')::INT, 0);
    v_attr_changes      := COALESCE(v_effects->'attributeChanges', '[]'::jsonb);

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

    INSERT INTO public.xp_transactions (character_id, amount, reason)
    VALUES (p_character_id, v_character_xp_gain, 'Квест выполнен: ' || v_title);

    UPDATE public.characters
    SET total_xp = v_new_total_xp,
        level    = v_new_level
    WHERE id = p_character_id;

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


-- ── 3c. complete_quest: same checks and result, completion via the core ─────
CREATE OR REPLACE FUNCTION public.complete_quest(
    p_quest_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    c_base_xp_multiplier CONSTANT INT := 10;

    v_user_id        UUID;
    v_character_id   UUID;
    v_old_level      INT;
    v_quest          RECORD;
    v_skill_id       UUID;
BEGIN
    -- 1. Auth check
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Fetch character
    SELECT id, level
    INTO v_character_id, v_old_level
    FROM public.characters
    WHERE profile_id = v_user_id;

    IF v_character_id IS NULL THEN
        RAISE EXCEPTION 'Character not found for authenticated user';
    END IF;

    -- 3. Fetch quest + verify ownership
    SELECT q.id, q.title, q.status, q.skill_name, q.hours, q.skill_id,
           dp.character_id AS plan_character_id
    INTO v_quest
    FROM public.quests q
    JOIN public.daily_plans dp ON dp.id = q.daily_plan_id
    WHERE q.id = p_quest_id;

    IF v_quest.id IS NULL THEN
        RAISE EXCEPTION 'Quest not found';
    END IF;

    IF v_quest.plan_character_id <> v_character_id THEN
        RAISE EXCEPTION 'Quest does not belong to user character';
    END IF;

    -- 4. Idempotency guard
    IF v_quest.status = 'completed' THEN
        RETURN jsonb_build_object(
            'success',            false,
            'message',            'Quest already completed',
            'xpAwarded',          0,
            'oldLevel',           v_old_level,
            'newLevel',           v_old_level,
            'nextLevelThreshold', c_base_xp_multiplier * (v_old_level + 1) * v_old_level,
            'attributeGained',    0,
            'skillXpGained',      0,
            'skillLevel',         0
        );
    END IF;

    -- 5. Resolve skill_id if missing on quest row but skill_name is present
    v_skill_id := v_quest.skill_id;
    IF v_skill_id IS NULL AND v_quest.skill_name IS NOT NULL AND trim(v_quest.skill_name) <> '' THEN
        INSERT INTO public.character_skills (character_id, name, total_hours, total_xp)
        VALUES (v_character_id, trim(v_quest.skill_name), 0, 0)
        ON CONFLICT (character_id, lower(name)) DO NOTHING;

        SELECT id INTO v_skill_id
        FROM public.character_skills
        WHERE character_id = v_character_id
          AND lower(name) = lower(trim(v_quest.skill_name));

        UPDATE public.quests SET skill_id = v_skill_id WHERE id = p_quest_id;
    END IF;

    -- 6. Shared completion core
    RETURN public._complete_quest_core(v_character_id, p_quest_id, v_skill_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_quest(UUID) TO authenticated;


-- ── 4. apply_day_report ─────────────────────────────────────────────────────
-- p_events: [{ description, hours, planned_quest_id?,
--              skill: { kind: 'existing', skill_id } | { kind: 'new', name, attributes: [code, code?], icon? }
--                     | { kind: 'none' } }]
-- Errors (RAISE … USING MESSAGE = <code>, DETAIL = json): NOT_AUTHENTICATED, CHARACTER_NOT_FOUND,
-- PARSE_NOT_FOUND, INVALID_EVENTS, INVALID_HOURS, DAY_HOURS_LIMIT, SKILL_NOT_FOUND,
-- INVALID_SKILL_ATTRIBUTES, QUEST_NOT_FOUND. Any error → nothing is written.
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
    v_skill            JSONB;
    v_kind             TEXT;
    v_hours            NUMERIC;
    v_description      TEXT;
    v_planned_id       UUID;
    v_quest            RECORD;
    v_quest_id         UUID;
    v_skill_id         UUID;
    v_skill_name       TEXT;
    v_new_name         TEXT;
    v_codes            TEXT[];
    v_attr_ids         UUID[];
    v_icon             TEXT;
    v_created_skill    BOOLEAN;
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

    -- 3. Idempotency: claim the parse. A second call (even a concurrent one — ON CONFLICT waits for the
    --    first transaction) gets the stored result back and changes nothing.
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

        -- a planned quest that is already completed adds nothing (it is skipped below)
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
        v_skill         := v_event->'skill';
        v_kind          := v_skill->>'kind';
        v_skill_id      := NULL;
        v_skill_name    := NULL;
        v_created_skill := false;

        -- 7a. Skill
        IF v_kind = 'existing' THEN
            SELECT id, name INTO v_skill_id, v_skill_name
            FROM public.character_skills
            WHERE id = NULLIF(v_skill->>'skill_id', '')::UUID
              AND character_id = v_character_id;
            IF v_skill_id IS NULL THEN
                RAISE EXCEPTION USING MESSAGE = 'SKILL_NOT_FOUND';
            END IF;

        ELSIF v_kind = 'new' THEN
            v_new_name := regexp_replace(btrim(COALESCE(v_skill->>'name', '')), '\s+', ' ', 'g');
            IF v_new_name = '' OR length(v_new_name) > 60 THEN
                RAISE EXCEPTION USING MESSAGE = 'INVALID_EVENTS';
            END IF;

            -- dedup: normalised name vs names and aliases of the user's skills
            SELECT cs.id, cs.name INTO v_skill_id, v_skill_name
            FROM public.character_skills cs
            WHERE cs.character_id = v_character_id
              AND (public._normalize_skill_name(cs.name) = public._normalize_skill_name(v_new_name)
                   OR EXISTS (SELECT 1 FROM unnest(cs.aliases) a
                              WHERE public._normalize_skill_name(a) = public._normalize_skill_name(v_new_name)))
            ORDER BY cs.created_at
            LIMIT 1;

            IF v_skill_id IS NULL THEN
                IF jsonb_typeof(v_skill->'attributes') <> 'array' THEN
                    RAISE EXCEPTION USING MESSAGE = 'INVALID_SKILL_ATTRIBUTES';
                END IF;
                SELECT array_agg(DISTINCT a) INTO v_codes
                FROM jsonb_array_elements_text(v_skill->'attributes') a;
                IF v_codes IS NULL OR cardinality(v_codes) < 1 OR cardinality(v_codes) > 2
                   OR jsonb_array_length(v_skill->'attributes') > 2 THEN
                    RAISE EXCEPTION USING MESSAGE = 'INVALID_SKILL_ATTRIBUTES';
                END IF;
                -- keep the order the attributes were given in (primary first)
                SELECT array_agg(ad.id ORDER BY o.ord) INTO v_attr_ids
                FROM jsonb_array_elements_text(v_skill->'attributes') WITH ORDINALITY o(code, ord)
                JOIN public.attribute_definitions ad ON ad.code = o.code;
                IF v_attr_ids IS NULL OR cardinality(v_attr_ids) <> jsonb_array_length(v_skill->'attributes') THEN
                    RAISE EXCEPTION USING MESSAGE = 'INVALID_SKILL_ATTRIBUTES';
                END IF;

                v_icon := v_skill->>'icon';
                IF v_icon IS NOT NULL AND v_icon !~ '^[a-z0-9_]{1,40}$' THEN
                    v_icon := NULL;
                END IF;

                INSERT INTO public.character_skills
                    (character_id, name, primary_attribute_id, secondary_attribute_id, icon, total_hours, total_xp)
                VALUES
                    (v_character_id, v_new_name, v_attr_ids[1], v_attr_ids[2], v_icon, 0, 0)
                RETURNING id, name INTO v_skill_id, v_skill_name;

                v_created_skill := true;
                v_new_skills := v_new_skills || jsonb_build_array(jsonb_build_object(
                    'id', v_skill_id, 'name', v_skill_name, 'icon', v_icon,
                    'attributes', to_jsonb(v_codes)));
            END IF;

        ELSIF v_kind IS DISTINCT FROM 'none' THEN
            RAISE EXCEPTION USING MESSAGE = 'INVALID_EVENTS';
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
                    'skillId', v_skill_id, 'skillName', v_skill_name, 'createdSkill', v_created_skill,
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
                                       skill_id, skill_name)
            VALUES (v_plan_id, v_description, v_event->>'description', 'pending', v_next_position, v_hours,
                    v_skill_id, v_skill_name)
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
            'skillId', v_skill_id, 'skillName', v_skill_name, 'createdSkill', v_created_skill,
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
