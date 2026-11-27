-- ============================================================
-- Migration: apply_day_plan — items for the plan date and the next day; appending to existing plans
-- ============================================================
-- Same contract as 20261127120000, plus:
-- • an item may carry `date` ('YYYY-MM-DD'): p_plan_date (default) or p_plan_date + 1, anything else → INVALID_ITEMS;
--   the plan of that date is created when missing (_ensure_daily_plan);
-- • the 960-minute limit is checked per date: pending quests of the date + this apply's items of the date
--   (PLAN_HOURS_LIMIT DETAIL gets `date`);
-- • planned_at = scheduled_at = now() explicitly;
-- • each returned quest has `date`.
-- There is no per-date lock: every new parse appends quests to the date (idempotency is per parse_id only).

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
    v_date           DATE;
    v_title          TEXT;
    v_start_text     TEXT;
    v_start          TIME;
    v_duration       INT;
    v_skill          RECORD;
    v_quest_id       UUID;

    v_dates          DATE[] := ARRAY[]::DATE[];
    v_new_min        INT[] := ARRAY[0, 0]; -- [plan date, next day]
    v_existing_min   INT;
    v_total_min      INT := 0;
    v_idx            INT;

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

    -- 4. Validate the items and count the minutes they add per date
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
        IF (v_item->>'date') IS NOT NULL
           AND ((v_item->>'date') !~ '^\d{4}-\d{2}-\d{2}$'
                OR (v_item->>'date')::DATE NOT IN (p_plan_date, p_plan_date + 1)) THEN
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
        v_date := COALESCE((v_item->>'date')::DATE, p_plan_date);
        v_idx := CASE WHEN v_date = p_plan_date THEN 1 ELSE 2 END;
        v_new_min[v_idx] := v_new_min[v_idx] + v_duration;
    END LOOP;

    -- 5. Plan limit per date: pending quests of the date + this apply's items of the date ≤ 960 minutes
    FOR v_idx IN 1..2 LOOP
        CONTINUE WHEN v_idx = 2 AND v_new_min[v_idx] = 0;
        v_date := p_plan_date + (v_idx - 1);
        SELECT COALESCE(sum(COALESCE(q.duration_minutes, round(q.hours * 60)::INT, 0)), 0)::INT
        INTO v_existing_min
        FROM public.quests q
        JOIN public.daily_plans dp ON dp.id = q.daily_plan_id
        WHERE dp.character_id = v_character_id AND dp.date = v_date AND q.status = 'pending';

        IF v_existing_min + v_new_min[v_idx] > c_max_plan_min THEN
            RAISE EXCEPTION USING MESSAGE = 'PLAN_HOURS_LIMIT',
                DETAIL = jsonb_build_object('date', v_date, 'existingMinutes', v_existing_min,
                                            'newMinutes', v_new_min[v_idx],
                                            'totalMinutes', v_existing_min + v_new_min[v_idx],
                                            'limit', c_max_plan_min)::TEXT;
        END IF;
        IF v_idx = 1 THEN
            v_total_min := v_existing_min + v_new_min[v_idx];
        END IF;
    END LOOP;

    -- 6. Create the quests in date and time order (items without a time last, then in the given order)
    FOR v_item IN
        SELECT e.value
        FROM jsonb_array_elements(p_items) WITH ORDINALITY e(value, ord)
        ORDER BY COALESCE(e.value->>'date', p_plan_date::TEXT), (e.value->>'start_time') IS NULL,
                 (e.value->>'start_time'), e.ord
    LOOP
        v_date     := COALESCE((v_item->>'date')::DATE, p_plan_date);
        v_title    := btrim(v_item->>'title');
        v_start    := (v_item->>'start_time')::TIME;
        v_duration := (v_item->>'duration_minutes')::INT;
        v_plan_id  := public._ensure_daily_plan(v_character_id, v_date);

        SELECT * INTO v_skill
        FROM public._resolve_event_skill(v_character_id, v_item->'skill', 'INVALID_ITEMS');
        IF v_skill.created THEN
            v_new_skills := v_new_skills || jsonb_build_array(jsonb_build_object(
                'id', v_skill.skill_id, 'name', v_skill.skill_name, 'icon', v_skill.icon,
                'attributes', to_jsonb(v_skill.codes)));
        END IF;

        SELECT COALESCE(max(position), -1) + 1 INTO v_next_position
        FROM public.quests WHERE daily_plan_id = v_plan_id;

        INSERT INTO public.quests (daily_plan_id, title, status, position, hours, skill_id, skill_name,
                                   start_time, duration_minutes, source, planned_at, scheduled_at)
        VALUES (v_plan_id, v_title, 'pending', v_next_position, round(v_duration / 60.0, 2),
                v_skill.skill_id, v_skill.skill_name, v_start, v_duration, 'ai_plan', now(), now())
        RETURNING id INTO v_quest_id;

        v_quests_out := v_quests_out || jsonb_build_array(jsonb_build_object(
            'id', v_quest_id, 'title', v_title, 'date', v_date, 'startTime', to_char(v_start, 'HH24:MI'),
            'durationMinutes', v_duration, 'skillId', v_skill.skill_id, 'skillName', v_skill.skill_name,
            'createdSkill', v_skill.created));
    END LOOP;

    v_result := jsonb_build_object(
        'success',      true,
        'planId',       public._ensure_daily_plan(v_character_id, p_plan_date),
        'planDate',     p_plan_date,
        'quests',       v_quests_out,
        'newSkills',    v_new_skills,
        'totalMinutes', v_total_min
    );

    UPDATE public.day_plan_applications SET result = v_result WHERE parse_id = p_parse_id;

    RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_day_plan(DATE, JSONB, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_day_plan(DATE, JSONB, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.apply_day_plan(DATE, JSONB, UUID) TO authenticated;
