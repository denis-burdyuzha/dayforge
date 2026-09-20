-- ── Test Verification Function ────────────────────────────────────────────
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
