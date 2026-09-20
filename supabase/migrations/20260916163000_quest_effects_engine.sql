-- ============================================================
-- Migration: Skill Attribute Tags and Quest Effects Engine
-- ============================================================

-- ── 1. Schema Changes ────────────────────────────────────────────────────────
-- Add attribute FKs to character_skills
ALTER TABLE public.character_skills
    ADD COLUMN IF NOT EXISTS primary_attribute_id UUID REFERENCES public.attribute_definitions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS secondary_attribute_id UUID REFERENCES public.attribute_definitions(id) ON DELETE SET NULL;

-- Add skill_id FK to quests
ALTER TABLE public.quests
    ADD COLUMN IF NOT EXISTS skill_id UUID REFERENCES public.character_skills(id) ON DELETE SET NULL;

-- Link existing quests to character_skills if matching by character and skill_name
UPDATE public.quests q
SET skill_id = cs.id
FROM public.character_skills cs, public.daily_plans dp
WHERE dp.id = q.daily_plan_id
  AND cs.character_id = dp.character_id
  AND lower(cs.name) = lower(q.skill_name)
  AND q.skill_id IS NULL;


-- ── 2. Pure Engine Function: calculate_quest_effects ──────────────────────────
CREATE OR REPLACE FUNCTION public.calculate_quest_effects(
    p_skill_id UUID,
    p_hours NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
    c_form_grace_days       CONSTANT INT := 3;
    c_form_decay_per_day    CONSTANT INT := 5;
    c_form_min              CONSTANT INT := 20;

    v_last_practiced        TIMESTAMPTZ;
    v_primary_attr_id       UUID;
    v_secondary_attr_id     UUID;

    v_days_since            INT;
    v_form_percentage       INT;
    v_form_multiplier       NUMERIC;

    v_skill_xp              INT := 0;
    v_character_xp          INT := 0;
    v_attr_changes          JSONB := '[]'::jsonb;
    v_effective_hours       NUMERIC;
BEGIN
    v_effective_hours := COALESCE(p_hours, 1);

    -- Character XP = p_hours * 10 (rounded)
    v_character_xp := ROUND(v_effective_hours * 10)::INT;

    -- Fetch skill state if skill_id is provided
    IF p_skill_id IS NOT NULL THEN
        SELECT last_practiced_at, primary_attribute_id, secondary_attribute_id
        INTO v_last_practiced, v_primary_attr_id, v_secondary_attr_id
        FROM public.character_skills
        WHERE id = p_skill_id;
    END IF;

    -- Calculate Form percentage and Form multiplier
    IF p_skill_id IS NOT NULL THEN
        IF v_last_practiced IS NULL THEN
            v_form_percentage := 100;
        ELSE
            v_days_since := EXTRACT(DAY FROM (now() - v_last_practiced))::INT;
            IF v_days_since <= c_form_grace_days THEN
                v_form_percentage := 100;
            ELSE
                v_form_percentage := GREATEST(
                    c_form_min,
                    100 - (v_days_since - c_form_grace_days) * c_form_decay_per_day
                );
            END IF;
        END IF;

        v_form_multiplier :=
            CASE
                WHEN v_form_percentage >= 90 THEN 1.0
                WHEN v_form_percentage >= 70 THEN 0.9
                WHEN v_form_percentage >= 40 THEN 0.75
                ELSE                              0.5
            END;

        -- Skill XP = p_hours * 20 * form_multiplier (rounded)
        v_skill_xp := ROUND(COALESCE(p_hours, 0) * 20 * v_form_multiplier)::INT;
    ELSE
        v_skill_xp := 0;
    END IF;

    -- Attribute changes array: {attributeId, amount: 1} for non-null attribute IDs
    IF v_primary_attr_id IS NOT NULL THEN
        v_attr_changes := v_attr_changes || jsonb_build_array(
            jsonb_build_object('attributeId', v_primary_attr_id, 'amount', 1)
        );
    END IF;

    IF v_secondary_attr_id IS NOT NULL AND v_secondary_attr_id <> v_primary_attr_id THEN
        v_attr_changes := v_attr_changes || jsonb_build_array(
            jsonb_build_object('attributeId', v_secondary_attr_id, 'amount', 1)
        );
    END IF;

    RETURN jsonb_build_object(
        'characterXp',      v_character_xp,
        'skillXp',          v_skill_xp,
        'attributeChanges', v_attr_changes
    );
END;
$$;


-- ── 3. Updated complete_quest RPC (Consumes Engine Result) ───────────────────
CREATE OR REPLACE FUNCTION public.complete_quest(
    p_quest_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    c_base_xp_multiplier        CONSTANT INT := 10;
    c_skill_base_xp_multiplier   CONSTANT INT := 10;

    v_user_id           UUID;
    v_character_id      UUID;
    v_quest             RECORD;
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

    v_skill_id          UUID;
    v_skill_old_xp      INT;
    v_skill_new_xp      INT;
    v_skill_level       INT := 0;
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

    -- Resolve skill_id if missing on quest row but skill_name is present
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

    -- 5. Mark quest completed
    UPDATE public.quests
    SET status = 'completed'
    WHERE id = p_quest_id;

    -- 6. ONE call to calculate_quest_effects engine
    v_effects := public.calculate_quest_effects(v_skill_id, v_quest.hours);

    v_character_xp_gain := COALESCE((v_effects->>'characterXp')::INT, 10);
    v_skill_xp_gain     := COALESCE((v_effects->>'skillXp')::INT, 0);
    v_attr_changes      := COALESCE(v_effects->'attributeChanges', '[]'::jsonb);

    -- 7. Apply character XP & level
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
    VALUES (v_character_id, v_character_xp_gain, 'Квест выполнен: ' || v_quest.title);

    UPDATE public.characters
    SET total_xp = v_new_total_xp,
        level    = v_new_level
    WHERE id = v_character_id;

    -- 8. Apply attribute updates from v_attr_changes
    FOR v_attr_elem IN SELECT * FROM jsonb_array_elements(v_attr_changes)
    LOOP
        v_attr_id     := (v_attr_elem->>'attributeId')::UUID;
        v_attr_amount := COALESCE((v_attr_elem->>'amount')::INT, 1);

        IF v_attr_id IS NOT NULL THEN
            UPDATE public.character_attributes
            SET value = value + v_attr_amount
            WHERE character_id = v_character_id
              AND attribute_id = v_attr_id;

            v_attrs_updated_cnt := v_attrs_updated_cnt + 1;
        END IF;
    END LOOP;

    -- 9. Update skill progression if v_skill_id is present
    IF v_skill_id IS NOT NULL THEN
        SELECT total_xp INTO v_skill_old_xp
        FROM public.character_skills
        WHERE id = v_skill_id;

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
        SET total_hours       = total_hours + COALESCE(v_quest.hours, 0),
            total_xp          = v_skill_new_xp,
            last_practiced_at = now()
        WHERE id = v_skill_id;
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


-- ── 4. Test Verification Function ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.test_quest_engine()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_intel_id    UUID;
    v_focus_id    UUID;
    v_disc_id     UUID;
    v_char_id     UUID;
    v_skill1_id   UUID;
    v_skill2_id   UUID;
    v_res1        JSONB;
    v_res2        JSONB;
BEGIN
    SELECT id INTO v_intel_id FROM public.attribute_definitions WHERE code = 'intelligence';
    SELECT id INTO v_focus_id FROM public.attribute_definitions WHERE code = 'focus';
    SELECT id INTO v_disc_id  FROM public.attribute_definitions WHERE code = 'discipline';
    
    SELECT id INTO v_char_id FROM public.characters LIMIT 1;
    IF v_char_id IS NULL THEN
        v_char_id := gen_random_uuid();
    END IF;

    -- 1. Create skill with tags Intelligence + Focus
    INSERT INTO public.character_skills (character_id, name, primary_attribute_id, secondary_attribute_id, total_hours, total_xp)
    VALUES (v_char_id, 'Rust_Test_Skill_' || gen_random_uuid()::text, v_intel_id, v_focus_id, 0, 0)
    RETURNING id INTO v_skill1_id;

    -- Call engine
    v_res1 := public.calculate_quest_effects(v_skill1_id, 1);

    -- 2. Create skill without tags (NULL)
    INSERT INTO public.character_skills (character_id, name, primary_attribute_id, secondary_attribute_id, total_hours, total_xp)
    VALUES (v_char_id, 'Untagged_Test_Skill_' || gen_random_uuid()::text, NULL, NULL, 0, 0)
    RETURNING id INTO v_skill2_id;

    -- Call engine
    v_res2 := public.calculate_quest_effects(v_skill2_id, 1);

    -- Clean up test skills
    DELETE FROM public.character_skills WHERE id IN (v_skill1_id, v_skill2_id);

    RETURN jsonb_build_object(
        'intelId', v_intel_id,
        'focusId', v_focus_id,
        'discId',  v_disc_id,
        'test1_tagged_skill', v_res1,
        'test2_untagged_skill', v_res2
    );
END;
$$;
