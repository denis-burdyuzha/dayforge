-- Migration: Create atomic complete_quest RPC function

CREATE OR REPLACE FUNCTION public.complete_quest(
    p_quest_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_character_id UUID;
    v_quest RECORD;
    v_old_total_xp INT;
    v_old_level INT;
    v_new_total_xp INT;
    v_new_level INT;
    v_lvl INT;
    v_threshold INT;
    v_xp_reward INT;
BEGIN
    -- 1. Check authentication
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Fetch user's character
    SELECT id, total_xp, level INTO v_character_id, v_old_total_xp, v_old_level
    FROM public.characters
    WHERE profile_id = v_user_id;

    IF v_character_id IS NULL THEN
        RAISE EXCEPTION 'Character not found for authenticated user';
    END IF;

    -- 3. Fetch quest and verify ownership via daily_plans
    SELECT q.id, q.title, q.status, q.xp_reward, q.attribute_id, dp.character_id
    INTO v_quest
    FROM public.quests q
    JOIN public.daily_plans dp ON dp.id = q.daily_plan_id
    WHERE q.id = p_quest_id;

    IF v_quest.id IS NULL THEN
        RAISE EXCEPTION 'Quest not found';
    END IF;

    IF v_quest.character_id <> v_character_id THEN
        RAISE EXCEPTION 'Quest does not belong to user character';
    END IF;

    -- Idempotency check: if already completed, return without duplicate awards
    IF v_quest.status = 'completed' THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Quest already completed',
            'xpAwarded', 0,
            'oldLevel', v_old_level,
            'newLevel', v_old_level
        );
    END IF;

    v_xp_reward := COALESCE(v_quest.xp_reward, 10);

    -- 4. Mark quest as completed
    UPDATE public.quests
    SET status = 'completed'
    WHERE id = p_quest_id;

    -- 5. Calculate new total XP and level
    v_new_total_xp := v_old_total_xp + v_xp_reward;
    v_new_level := 1;
    v_lvl := 2;
    LOOP
        v_threshold := (100 * (v_lvl - 1) * (v_lvl + 2)) / 2;
        IF v_threshold <= v_new_total_xp THEN
            v_new_level := v_lvl;
            v_lvl := v_lvl + 1;
        ELSE
            EXIT;
        END IF;
    END LOOP;

    -- 6. Insert xp_transaction
    INSERT INTO public.xp_transactions (
        character_id,
        amount,
        reason
    ) VALUES (
        v_character_id,
        v_xp_reward,
        'Квест выполнен: ' || v_quest.title
    );

    -- 7. Update character XP and level
    UPDATE public.characters
    SET total_xp = v_new_total_xp,
        level = v_new_level
    WHERE id = v_character_id;

    -- 8. Update character_attributes if quest has attribute_id
    IF v_quest.attribute_id IS NOT NULL THEN
        UPDATE public.character_attributes
        SET value = value + v_xp_reward
        WHERE character_id = v_character_id
          AND attribute_id = v_quest.attribute_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'xpAwarded', v_xp_reward,
        'oldLevel', v_old_level,
        'newLevel', v_new_level
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_quest(UUID) TO authenticated;
