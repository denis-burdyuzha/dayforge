-- ============================================================
-- Migration: Refactor Dayforge Model (Skills, Attributes, Quests)
-- ============================================================

-- ── 1. Fix character_skills uniqueness (character_id, lower(name)) ──────────
ALTER TABLE public.character_skills DROP CONSTRAINT IF EXISTS character_skills_unique;
ALTER TABLE public.character_skills DROP CONSTRAINT IF EXISTS character_skills_character_id_name_key;
DROP INDEX IF EXISTS public.character_skills_character_id_lower_name_idx;

CREATE UNIQUE INDEX character_skills_character_id_lower_name_idx
    ON public.character_skills (character_id, lower(name));

-- Drop obsolete columns if any exist
ALTER TABLE public.character_skills
    DROP COLUMN IF EXISTS category,
    DROP COLUMN IF EXISTS skill_xp_reward,
    DROP COLUMN IF EXISTS level_xp_requirement,
    DROP COLUMN IF EXISTS max_level;


-- ── 2. Migrate existing user_skills into character_skills ───────────────────
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'user_skills'
    ) THEN
        INSERT INTO public.character_skills (character_id, name, total_hours, total_xp, last_practiced_at)
        SELECT
            us.character_id,
            s.name,
            0 AS total_hours,
            COALESCE(us.xp, 0) AS total_xp,
            NULL AS last_practiced_at
        FROM public.user_skills us
        JOIN public.skills s ON s.id = us.skill_id
        ON CONFLICT (character_id, lower(name)) DO NOTHING;

        DROP TABLE public.user_skills CASCADE;
    END IF;
END $$;


-- ── 3. Update complete_onboarding RPC to seed character_skills ──────────────
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
    v_skill_name         TEXT;
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

    -- 4. Seed starting skills in character_skills
    FOREACH v_direction IN ARRAY p_starting_directions LOOP
        SELECT name
        INTO   v_skill_name
        FROM   public.skills
        WHERE  code = v_direction;

        IF v_skill_name IS NOT NULL THEN
            INSERT INTO public.character_skills (character_id, name, total_hours, total_xp)
            VALUES (v_character_id, v_skill_name, 0, 0)
            ON CONFLICT (character_id, lower(name)) DO NOTHING;
        END IF;
    END LOOP;

    RETURN jsonb_build_object('character_id', v_character_id);
END;
$$;


-- ── 4. Update complete_quest RPC (Deterministic system XP & skill XP) ───────
CREATE OR REPLACE FUNCTION public.complete_quest(
    p_quest_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    -- Character level economy: threshold(level) = 10 * level * (level - 1)
    c_base_xp_multiplier          CONSTANT INT := 10;
    -- Attribute economy: fixed +1 per quest completion
    c_attribute_gain_per_quest     CONSTANT INT := 1;
    -- Skill economy: 20 XP per hour
    c_skill_xp_per_hour            CONSTANT INT := 20;
    c_skill_base_xp_multiplier     CONSTANT INT := 10;
    -- Form decay constants
    c_form_grace_days              CONSTANT INT := 3;
    c_form_decay_per_day           CONSTANT INT := 5;
    c_form_min                     CONSTANT INT := 20;

    v_user_id             UUID;
    v_character_id        UUID;
    v_quest               RECORD;
    v_old_total_xp        INT;
    v_old_level           INT;
    v_new_total_xp        INT;
    v_new_level           INT;
    v_lvl                 INT;
    v_threshold           INT;
    v_next_threshold      INT;
    v_xp_reward           INT;

    -- Skill working variables
    v_skill_name_clean    TEXT;
    v_skill_id            UUID;
    v_skill_old_xp        INT;
    v_skill_new_xp        INT;
    v_skill_last_practiced TIMESTAMPTZ;
    v_days_since          INT;
    v_form_percentage     INT;
    v_form_multiplier     NUMERIC;
    v_skill_xp_gained     INT;
    v_skill_level         INT;
BEGIN
    -- 1. Auth check
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Fetch character
    SELECT id, total_xp, level
    INTO v_character_id, v_old_total_xp, v_old_level
    FROM public.characters
    WHERE profile_id = v_user_id;

    IF v_character_id IS NULL THEN
        RAISE EXCEPTION 'Character not found for authenticated user';
    END IF;

    -- 3. Fetch quest + verify ownership
    SELECT q.id, q.title, q.status, q.xp_reward, q.attribute_id,
           q.skill_name, q.hours, dp.character_id AS plan_character_id
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
        v_next_threshold := c_base_xp_multiplier * (v_old_level + 1) * v_old_level;
        RETURN jsonb_build_object(
            'success',            false,
            'message',            'Quest already completed',
            'xpAwarded',          0,
            'oldLevel',           v_old_level,
            'newLevel',           v_old_level,
            'nextLevelThreshold', v_next_threshold,
            'attributeGained',    0,
            'skillXpGained',      0,
            'skillLevel',         0
        );
    END IF;

    -- System awards fixed 10 XP for completing a quest (or legacy quest xp_reward if preset)
    v_xp_reward := COALESCE(v_quest.xp_reward, 10);

    -- 5. Mark quest completed
    UPDATE public.quests
    SET status = 'completed'
    WHERE id = p_quest_id;

    -- 6. Compute new character total XP + level
    v_new_total_xp := v_old_total_xp + v_xp_reward;
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

    -- 7. Insert XP transaction
    INSERT INTO public.xp_transactions (character_id, amount, reason)
    VALUES (v_character_id, v_xp_reward, 'Квест выполнен: ' || v_quest.title);

    -- 8. Update character total_xp + level
    UPDATE public.characters
    SET total_xp = v_new_total_xp,
        level    = v_new_level
    WHERE id = v_character_id;

    -- 9. Attribute gain (+1 fixed to discipline by default, or specific attribute if set)
    IF v_quest.attribute_id IS NOT NULL THEN
        UPDATE public.character_attributes
        SET value = value + c_attribute_gain_per_quest
        WHERE character_id = v_character_id
          AND attribute_id  = v_quest.attribute_id;
    ELSE
        UPDATE public.character_attributes ca
        SET value = value + c_attribute_gain_per_quest
        FROM public.attribute_definitions ad
        WHERE ca.character_id = v_character_id
          AND ca.attribute_id = ad.id
          AND ad.code = 'discipline';
    END IF;

    -- 10. Skill progression (case-insensitive find or create)
    v_skill_xp_gained := 0;
    v_skill_level     := 0;

    IF v_quest.skill_name IS NOT NULL
       AND trim(v_quest.skill_name) <> ''
       AND v_quest.hours IS NOT NULL
       AND v_quest.hours > 0
    THEN
        v_skill_name_clean := trim(v_quest.skill_name);

        -- Ensure skill row exists for character
        INSERT INTO public.character_skills (character_id, name, total_hours, total_xp)
        VALUES (v_character_id, v_skill_name_clean, 0, 0)
        ON CONFLICT (character_id, lower(name)) DO NOTHING;

        -- Fetch skill state
        SELECT id, total_xp, last_practiced_at
        INTO v_skill_id, v_skill_old_xp, v_skill_last_practiced
        FROM public.character_skills
        WHERE character_id = v_character_id
          AND lower(name)  = lower(v_skill_name_clean);

        -- Calculate Form BEFORE updating last_practiced_at
        IF v_skill_last_practiced IS NULL THEN
            v_form_percentage := 100;
        ELSE
            v_days_since := EXTRACT(DAY FROM now() - v_skill_last_practiced)::INT;
            IF v_days_since <= c_form_grace_days THEN
                v_form_percentage := 100;
            ELSE
                v_form_percentage := GREATEST(
                    c_form_min,
                    100 - (v_days_since - c_form_grace_days) * c_form_decay_per_day
                );
            END IF;
        END IF;

        -- Form multiplier tier
        v_form_multiplier :=
            CASE
                WHEN v_form_percentage >= 90 THEN 1.0
                WHEN v_form_percentage >= 70 THEN 0.9
                WHEN v_form_percentage >= 40 THEN 0.75
                ELSE                              0.5
            END;

        -- Skill XP = hours * 20 * form_multiplier
        v_skill_xp_gained := FLOOR(v_quest.hours * c_skill_xp_per_hour * v_form_multiplier)::INT;
        v_skill_new_xp    := v_skill_old_xp + v_skill_xp_gained;

        -- Compute skill level from total_xp
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

        -- Update skill row with hours, new total_xp, and last_practiced_at = now()
        UPDATE public.character_skills
        SET total_hours       = total_hours + v_quest.hours,
            total_xp          = v_skill_new_xp,
            last_practiced_at = now()
        WHERE id = v_skill_id;
    END IF;

    RETURN jsonb_build_object(
        'success',            true,
        'xpAwarded',          v_xp_reward,
        'oldLevel',           v_old_level,
        'newLevel',           v_new_level,
        'nextLevelThreshold', v_next_threshold,
        'attributeGained',    c_attribute_gain_per_quest,
        'skillXpGained',      v_skill_xp_gained,
        'skillLevel',         v_skill_level
    );
END;
$$;
