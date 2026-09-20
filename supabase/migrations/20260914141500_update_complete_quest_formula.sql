-- Migration: Update complete_quest RPC with new level threshold formula and search_path

CREATE OR REPLACE FUNCTION public.complete_quest(
    p_quest_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    -- Base XP multiplier for level threshold economy:
    -- Formula: threshold(level) = c_base_xp_multiplier * level * (level - 1)
    -- level 1 = 0 XP, level 2 = 20 XP, level 3 = 60 XP, level 4 = 120 XP, level 5 = 200 XP
    c_base_xp_multiplier CONSTANT INT := 10;
    
    v_user_id UUID;
    v_character_id UUID;
    v_quest RECORD;
    v_old_total_xp INT;
    v_old_level INT;
    v_new_total_xp INT;
    v_new_level INT;
    v_lvl INT;
    v_threshold INT;
    v_next_threshold INT;
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
        v_next_threshold := c_base_xp_multiplier * (v_old_level + 1) * v_old_level;
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Quest already completed',
            'xpAwarded', 0,
            'oldLevel', v_old_level,
            'newLevel', v_old_level,
            'nextLevelThreshold', v_next_threshold
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
        v_threshold := c_base_xp_multiplier * v_lvl * (v_lvl - 1);
        IF v_threshold <= v_new_total_xp THEN
            v_new_level := v_lvl;
            v_lvl := v_lvl + 1;
        ELSE
            EXIT;
        END IF;
    END LOOP;

    v_next_threshold := c_base_xp_multiplier * (v_new_level + 1) * v_new_level;

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
        'newLevel', v_new_level,
        'nextLevelThreshold', v_next_threshold
    );
END;
$$;
