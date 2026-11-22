-- ============================================================
-- Migration: complete_onboarding no longer seeds character_skills
-- ============================================================
-- Skills appear only from real quests (complete_quest). The previous version
-- (20260915190000_refactor_dayforge_model.sql, step 4) inserted one character_skills
-- row per chosen starting direction. That step is removed; everything else is
-- unchanged: signature (p_starting_directions is still accepted and validated —
-- the onboarding "directions" step stays as is), profile update + onboarding_completed,
-- character creation, 7 attributes = 1, SECURITY DEFINER, auth.uid().
-- Existing character_skills rows are NOT touched.

CREATE OR REPLACE FUNCTION public.complete_onboarding(
    p_username            TEXT,
    p_character_name      TEXT,
    p_class_id            TEXT,
    p_starting_directions TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id            UUID := auth.uid();
    v_character_id       UUID;
    v_already_completed  BOOLEAN;
    v_valid_classes      TEXT[] := ARRAY[
        'warrior', 'creator', 'explorer', 'strategist', 'wanderer'
    ];
    v_valid_directions   TEXT[] := ARRAY[
        'programming', 'fitness', 'learning',
        'career', 'finance', 'social', 'creativity'
    ];
    v_direction          TEXT;
    v_attr_code          TEXT;
    v_attr_id            UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT onboarding_completed
    INTO   v_already_completed
    FROM   public.profiles
    WHERE  id = v_user_id;

    IF v_already_completed IS TRUE THEN
        RAISE EXCEPTION 'Onboarding already completed';
    END IF;

    IF NOT (p_class_id = ANY(v_valid_classes)) THEN
        RAISE EXCEPTION 'Invalid class_id: %. Allowed values: %',
            p_class_id,
            array_to_string(v_valid_classes, ', ');
    END IF;

    FOREACH v_direction IN ARRAY p_starting_directions LOOP
        IF NOT (v_direction = ANY(v_valid_directions)) THEN
            RAISE EXCEPTION 'Invalid starting direction: %. Allowed values: %',
                v_direction,
                array_to_string(v_valid_directions, ', ');
        END IF;
    END LOOP;

    -- 1. Update profile
    UPDATE public.profiles
    SET
        username             = p_username,
        onboarding_completed = true,
        updated_at           = now()
    WHERE id = v_user_id;

    -- 2. Create character
    INSERT INTO public.characters (profile_id, name, class)
    VALUES (v_user_id, p_character_name, p_class_id)
    RETURNING id INTO v_character_id;

    -- 3. Seed all 7 attributes with value = 1
    FOREACH v_attr_code IN ARRAY ARRAY[
        'endurance', 'intelligence', 'social',
        'strength', 'discipline', 'creativity', 'focus'
    ] LOOP
        SELECT id
        INTO   v_attr_id
        FROM   public.attribute_definitions
        WHERE  code = v_attr_code;

        IF v_attr_id IS NOT NULL THEN
            INSERT INTO public.character_attributes (character_id, attribute_id, value)
            VALUES (v_character_id, v_attr_id, 1);
        END IF;
    END LOOP;

    -- (step 4 "seed starting skills in character_skills" removed: skills come only from quests)

    RETURN jsonb_build_object('character_id', v_character_id);
END;
$$;
