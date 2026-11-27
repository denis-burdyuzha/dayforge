-- ============================================================
-- Migration: daily character snapshots (history for a future evolution replay)
-- ============================================================
-- 1. character_snapshots: one row per (character, local date) — the state after the last credit of that day
-- 2. helpers: _snapshot_tier (avatar asset tier 1..5), _snapshot_aspect (dominant attribute), _skill_level_for_xp
-- 3. _upsert_character_snapshot(p_character_id, p_date): computes everything from the current state, upserts
-- 4. writers: _complete_quest_core (used by complete_quest and apply_day_report) — date of the quest's plan;
--    complete_onboarding — new optional p_local_date (client's local date; default CURRENT_DATE)
-- 5. one-off snapshot of every existing character for CURRENT_DATE
-- Clients only read their own snapshots; rows are written only by the SECURITY DEFINER functions.


-- ── 1. Table ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.character_snapshots (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id  UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    -- the user's local date: the date of the quest / report the credit belongs to
    snapshot_date DATE NOT NULL,
    level         INTEGER NOT NULL,
    -- avatar asset tier by level (same thresholds as assetTierForLevel): 1–2 → 1, 3–9 → 2, 10–34 → 3,
    -- 35–49 → 4, 50+ → 5
    tier          INTEGER NOT NULL,
    total_xp      INTEGER NOT NULL,
    -- all 7 attributes: { code: value }
    attributes    JSONB NOT NULL,
    -- the dominant attribute: max ≥ 3 and strictly greater than the second (same rule as getAspect)
    aspect        TEXT NULL,
    -- up to 5 skills with the highest total_xp: [{ id, name, icon, level, total_xp, total_hours }]
    top_skills    JSONB NOT NULL DEFAULT '[]'::jsonb,
    skills_count  INTEGER NOT NULL DEFAULT 0,
    relics        JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT character_snapshots_character_date_key UNIQUE (character_id, snapshot_date),
    CONSTRAINT character_snapshots_tier_check CHECK (tier BETWEEN 1 AND 5)
);

ALTER TABLE public.character_snapshots ENABLE ROW LEVEL SECURITY;

-- The owner reads their character's snapshots. No insert/update/delete policies: writes only from
-- SECURITY DEFINER functions (they run as the table owner).
CREATE POLICY "character_snapshots: select own"
    ON public.character_snapshots
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.characters c
        WHERE c.id = character_snapshots.character_id AND c.profile_id = auth.uid()
    ));

REVOKE ALL ON public.character_snapshots FROM anon, authenticated;
GRANT SELECT ON public.character_snapshots TO authenticated;
GRANT ALL ON public.character_snapshots TO service_role;


-- ── 2. Helpers ──────────────────────────────────────────────────────────────
-- Avatar asset tier by level — mirrors src/entities/character/ui/ModularAvatar/tierFx.ts assetTierForLevel.
CREATE OR REPLACE FUNCTION public._snapshot_tier(p_level INT)
RETURNS INT
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
    SELECT CASE
        WHEN p_level >= 50 THEN 5
        WHEN p_level >= 35 THEN 4
        WHEN p_level >= 10 THEN 3
        WHEN p_level >= 3  THEN 2
        ELSE 1
    END
$$;

-- Aspect — mirrors src/entities/character/model/aspect.ts getAspect: over the 7 attributes (missing = 0), the
-- maximum value if it is ≥ 3 AND strictly greater than the second-largest value, else NULL.
CREATE OR REPLACE FUNCTION public._snapshot_aspect(p_attributes JSONB)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
    WITH v AS (
        SELECT k.code, COALESCE((p_attributes->>k.code)::NUMERIC, 0) AS value, k.ord
        FROM unnest(ARRAY['strength', 'endurance', 'intelligence', 'focus', 'discipline', 'social',
                          'creativity']) WITH ORDINALITY k(code, ord)
    ), ranked AS (
        SELECT code, value, row_number() OVER (ORDER BY value DESC, ord) AS rn FROM v
    )
    SELECT b.code
    FROM ranked b, ranked s
    WHERE b.rn = 1 AND s.rn = 2 AND b.value >= 3 AND b.value > s.value
$$;

-- Skill level by total XP — mirrors computeSkillLevel (threshold of level n = 10·n·(n−1)).
CREATE OR REPLACE FUNCTION public._skill_level_for_xp(p_xp INT)
RETURNS INT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
DECLARE
    v_level INT := 1;
BEGIN
    WHILE 10 * (v_level + 1) * v_level <= COALESCE(p_xp, 0) LOOP
        v_level := v_level + 1;
    END LOOP;
    RETURN v_level;
END;
$$;


-- ── 3. Upsert of the snapshot for a date ────────────────────────────────────
CREATE OR REPLACE FUNCTION public._upsert_character_snapshot(
    p_character_id UUID,
    p_date         DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_level        INT;
    v_total_xp     INT;
    v_attributes   JSONB;
    v_top_skills   JSONB;
    v_skills_count INT;
BEGIN
    SELECT level, total_xp INTO v_level, v_total_xp
    FROM public.characters
    WHERE id = p_character_id;

    IF NOT FOUND OR p_date IS NULL THEN
        RETURN;
    END IF;

    SELECT jsonb_object_agg(ad.code, COALESCE(ca.value, 0)) INTO v_attributes
    FROM public.attribute_definitions ad
    LEFT JOIN public.character_attributes ca
           ON ca.attribute_id = ad.id AND ca.character_id = p_character_id;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
               'id', t.id, 'name', t.name, 'icon', t.icon, 'level', public._skill_level_for_xp(t.total_xp),
               'total_xp', t.total_xp, 'total_hours', t.total_hours)
             ORDER BY t.total_xp DESC, t.total_hours DESC, t.created_at, t.id), '[]'::jsonb)
    INTO v_top_skills
    FROM (
        SELECT cs.id, cs.name, cs.icon, cs.total_xp, cs.total_hours, cs.created_at
        FROM public.character_skills cs
        WHERE cs.character_id = p_character_id
        ORDER BY cs.total_xp DESC, cs.total_hours DESC, cs.created_at, cs.id
        LIMIT 5
    ) t;

    SELECT count(*) INTO v_skills_count
    FROM public.character_skills
    WHERE character_id = p_character_id;

    INSERT INTO public.character_snapshots
        (character_id, snapshot_date, level, tier, total_xp, attributes, aspect, top_skills, skills_count)
    VALUES
        (p_character_id, p_date, v_level, public._snapshot_tier(v_level), v_total_xp,
         COALESCE(v_attributes, '{}'::jsonb), public._snapshot_aspect(v_attributes), v_top_skills,
         v_skills_count)
    ON CONFLICT (character_id, snapshot_date) DO UPDATE
    SET level        = EXCLUDED.level,
        tier         = EXCLUDED.tier,
        total_xp     = EXCLUDED.total_xp,
        attributes   = EXCLUDED.attributes,
        aspect       = EXCLUDED.aspect,
        top_skills   = EXCLUDED.top_skills,
        skills_count = EXCLUDED.skills_count,
        updated_at   = now();
END;
$$;

REVOKE ALL ON FUNCTION public._upsert_character_snapshot(UUID, DATE) FROM PUBLIC;
REVOKE ALL ON FUNCTION public._upsert_character_snapshot(UUID, DATE) FROM anon, authenticated;


-- ── 4a. Completion core: snapshot at the end ────────────────────────────────
-- Same as 20261127120000 except the final snapshot for the date of the quest's plan.
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
    v_plan_date         DATE;
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
    SELECT q.title, q.hours, dp.date INTO v_title, v_hours, v_plan_date
    FROM public.quests q
    JOIN public.daily_plans dp ON dp.id = q.daily_plan_id
    WHERE q.id = p_quest_id;

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

    -- 6. Daily snapshot for the date the credit belongs to (the quest's plan date)
    PERFORM public._upsert_character_snapshot(p_character_id, v_plan_date);

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


-- ── 4b. complete_onboarding: + p_local_date, snapshot of the new character ──
-- Same as 20261122150000 plus an optional p_local_date (the client's local date, default CURRENT_DATE) and the
-- first snapshot. The old 4-argument signature is replaced (callers without p_local_date keep working).
DROP FUNCTION IF EXISTS public.complete_onboarding(TEXT, TEXT, TEXT, TEXT[]);

CREATE OR REPLACE FUNCTION public.complete_onboarding(
    p_username            TEXT,
    p_character_name      TEXT,
    p_class_id            TEXT,
    p_starting_directions TEXT[],
    p_local_date          DATE DEFAULT NULL
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

    -- 4. First snapshot (day 0 of the evolution)
    PERFORM public._upsert_character_snapshot(v_character_id, COALESCE(p_local_date, CURRENT_DATE));

    RETURN jsonb_build_object('character_id', v_character_id);
END;
$$;

REVOKE ALL ON FUNCTION public.complete_onboarding(TEXT, TEXT, TEXT, TEXT[], DATE) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_onboarding(TEXT, TEXT, TEXT, TEXT[], DATE) FROM anon;
GRANT EXECUTE ON FUNCTION public.complete_onboarding(TEXT, TEXT, TEXT, TEXT[], DATE) TO authenticated;


-- ── 5. One-off snapshot of every existing character ─────────────────────────
DO $$
DECLARE
    v_id UUID;
BEGIN
    FOR v_id IN SELECT id FROM public.characters LOOP
        PERFORM public._upsert_character_snapshot(v_id, CURRENT_DATE);
    END LOOP;
END;
$$;
