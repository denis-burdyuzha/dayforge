-- ============================================================
-- Migration: Update complete_quest RPC
--
-- Changes from previous version:
--   1. character_attributes.value += 1 (fixed constant, not += xp_reward)
--   2. Skill progression: upsert character_skills, form decay, XP by hours
--   3. Extended JSON response with attributeGained / skillXpGained / skillLevel
-- ============================================================

CREATE OR REPLACE FUNCTION public.complete_quest(
    p_quest_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    -- ── Character level economy ──────────────────────────────────────────
    -- Formula: threshold(level) = c_base_xp_multiplier * level * (level - 1)
    -- level 1 = 0 XP, level 2 = 20 XP, level 3 = 60 XP, level 4 = 120 XP
    c_base_xp_multiplier          CONSTANT INT := 10;

    -- ── Attribute economy ────────────────────────────────────────────────
    -- Fixed +1 per quest regardless of xp_reward size → prevents runaway inflation
    c_attribute_gain_per_quest     CONSTANT INT := 1;

    -- ── Skill economy ────────────────────────────────────────────────────
    -- Base XP per hour of practice BEFORE form multiplier
    c_skill_xp_per_hour            CONSTANT INT := 20;
    -- Skill-specific level multiplier (separate from character to allow independent tuning)
    -- Formula: skill_threshold(level) = c_skill_base_xp_multiplier * level * (level - 1)
    c_skill_base_xp_multiplier     CONSTANT INT := 10;

    -- ── Form decay constants ─────────────────────────────────────────────
    -- Days after last practice where form remains at 100%
    c_form_grace_days              CONSTANT INT := 3;
    -- Percent of form lost per day after grace period
    c_form_decay_per_day           CONSTANT INT := 5;
    -- Minimum form floor — never reaches 0 so past level is never "erased"
    c_form_min                     CONSTANT INT := 20;

    -- ── Working variables ────────────────────────────────────────────────
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
    v_skill_name_norm     TEXT;       -- lower(trim(skill_name))
    v_skill_id            UUID;
    v_skill_old_xp        INT;
    v_skill_new_xp        INT;
    v_skill_last_practiced timestamptz;
    v_days_since          INT;
    v_form_percentage     INT;
    v_form_multiplier     NUMERIC;
    v_skill_xp_gained     INT;
    v_skill_level         INT;
BEGIN
    -- ── 1. Auth check ────────────────────────────────────────────────────
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- ── 2. Fetch character ───────────────────────────────────────────────
    SELECT id, total_xp, level
    INTO v_character_id, v_old_total_xp, v_old_level
    FROM public.characters
    WHERE profile_id = v_user_id;

    IF v_character_id IS NULL THEN
        RAISE EXCEPTION 'Character not found for authenticated user';
    END IF;

    -- ── 3. Fetch quest + verify ownership ────────────────────────────────
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

    -- ── 4. Idempotency guard ─────────────────────────────────────────────
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

    v_xp_reward := COALESCE(v_quest.xp_reward, 10);

    -- ── 5. Mark quest completed ──────────────────────────────────────────
    UPDATE public.quests
    SET status = 'completed'
    WHERE id = p_quest_id;

    -- ── 6. Compute new character XP + level ──────────────────────────────
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

    -- ── 7. Insert XP transaction ─────────────────────────────────────────
    INSERT INTO public.xp_transactions (character_id, amount, reason)
    VALUES (v_character_id, v_xp_reward, 'Квест выполнен: ' || v_quest.title);

    -- ── 8. Update character total_xp + level ─────────────────────────────
    UPDATE public.characters
    SET total_xp = v_new_total_xp,
        level    = v_new_level
    WHERE id = v_character_id;

    -- ── 9. Attribute gain (+1 fixed, NOT += xp_reward) ───────────────────
    IF v_quest.attribute_id IS NOT NULL THEN
        UPDATE public.character_attributes
        SET value = value + c_attribute_gain_per_quest
        WHERE character_id = v_character_id
          AND attribute_id  = v_quest.attribute_id;
    END IF;

    -- ── 10. Skill progression (atomic, same transaction) ─────────────────
    v_skill_xp_gained := 0;
    v_skill_level     := 0;

    IF v_quest.skill_name IS NOT NULL
       AND v_quest.hours   IS NOT NULL
       AND v_quest.hours   >  0
    THEN
        v_skill_name_norm := lower(trim(v_quest.skill_name));

        -- 10a. Ensure skill row exists (create if first time)
        INSERT INTO public.character_skills (character_id, name)
        VALUES (v_character_id, v_skill_name_norm)
        ON CONFLICT (character_id, name) DO NOTHING;

        -- 10b. Read current skill state to compute form BEFORE update
        SELECT id, total_xp, last_practiced_at
        INTO v_skill_id, v_skill_old_xp, v_skill_last_practiced
        FROM public.character_skills
        WHERE character_id = v_character_id
          AND name         = v_skill_name_norm;

        -- 10c. Compute form_percentage from last_practiced_at
        --      If NULL (never practiced) → 100%
        --      If within grace period   → 100%
        --      After grace: MAX(20, 100 - (days - grace) * 5)
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

        -- 10d. Resolve form_multiplier tier
        --      form >= 90 → 1.0 | >= 70 → 0.9 | >= 40 → 0.75 | < 40 → 0.5
        v_form_multiplier :=
            CASE
                WHEN v_form_percentage >= 90 THEN 1.0
                WHEN v_form_percentage >= 70 THEN 0.9
                WHEN v_form_percentage >= 40 THEN 0.75
                ELSE                              0.5
            END;

        -- 10e. Calculate XP gained for this practice session
        v_skill_xp_gained := FLOOR(v_quest.hours * c_skill_xp_per_hour * v_form_multiplier)::INT;

        v_skill_new_xp := v_skill_old_xp + v_skill_xp_gained;

        -- 10f. Compute new skill level from total_xp (same LOOP pattern as character)
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

        -- 10g. Update skill row (last_practiced_at = now() → form resets to 100% next check)
        UPDATE public.character_skills
        SET total_hours       = total_hours + v_quest.hours,
            total_xp          = v_skill_new_xp,
            last_practiced_at = now()
        WHERE id = v_skill_id;
    END IF;

    -- ── 11. Return result ────────────────────────────────────────────────
    RETURN jsonb_build_object(
        'success',            true,
        'xpAwarded',          v_xp_reward,
        'oldLevel',           v_old_level,
        'newLevel',           v_new_level,
        'nextLevelThreshold', v_next_threshold,
        'attributeGained',    CASE WHEN v_quest.attribute_id IS NOT NULL
                                   THEN c_attribute_gain_per_quest ELSE 0 END,
        'skillXpGained',      v_skill_xp_gained,
        'skillLevel',         v_skill_level
    );
END;
$$;
