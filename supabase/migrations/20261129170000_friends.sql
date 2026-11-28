-- Friends: mutual friendship by code / invite link, friend cards with a safe day summary.
--
-- 1. profiles.friend_code — 8 characters of ABCDEFGHJKMNPQRSTUVWXYZ23456789 (no 0/O, 1/I/L), unique, set for
--    existing and new profiles (DEFAULT). profiles.share_daily_summary — the user lets friends see the day summary
--    (column GRANT UPDATE; friend_code is not client-writable — regenerate_friend_code).
-- 2. friendships(user_low, user_high): one row per pair, user_low < user_high; RLS: a user reads the rows they are
--    in; writes only via the RPCs below.
-- 3. RPCs (SECURITY DEFINER, auth.uid()):
--    add_friend_by_code(code) → { friend_user_id, name, already_friends }
--        INVALID_CODE, CANNOT_FRIEND_SELF, FRIEND_LIMIT (100 at either side), RATE_LIMIT (20 new friends / 24 h);
--    remove_friend(friend_user_id) → { removed } (for both sides at once);
--    regenerate_friend_code() → { code }; get_my_friend_code() → { code, share_daily_summary };
--    get_friends() → [card]; get_friend_profile(friend_user_id) → card + longest, week, days (NOT_FRIENDS).
--    A card has only these fields: user_id, name, class, level, tier, aspect, attributes, title_skill
--    { name, level, icon, primary_attribute }, streak, today_done, summary.
--    summary = { planned_count, completed_count, completed_hours, skills ≤ 3 } of the friend's day, or null when
--    the friend hides it. Never report texts, plan texts or quest titles.
-- Friends' data reaches the client only through these functions — no RLS policy reads other people's rows.

-- ── 1. profiles ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public._new_friend_code()
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    c_alphabet CONSTANT TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    v_bytes BYTEA;
    v_code  TEXT;
BEGIN
    LOOP
        -- gen_random_uuid() draws from the strong random source (random() is predictable)
        v_bytes := decode(replace(gen_random_uuid()::TEXT, '-', ''), 'hex');
        v_code := '';
        FOR i IN 0..7 LOOP
            v_code := v_code || substr(c_alphabet, get_byte(v_bytes, i) % 31 + 1, 1);
        END LOOP;
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE friend_code = v_code);
    END LOOP;
    RETURN v_code;
END;
$$;

REVOKE ALL ON FUNCTION public._new_friend_code() FROM PUBLIC, anon, authenticated;

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS friend_code         TEXT NULL,
    ADD COLUMN IF NOT EXISTS share_daily_summary BOOLEAN NOT NULL DEFAULT true;

UPDATE public.profiles SET friend_code = public._new_friend_code() WHERE friend_code IS NULL;

ALTER TABLE public.profiles
    ALTER COLUMN friend_code SET DEFAULT public._new_friend_code(),
    ALTER COLUMN friend_code SET NOT NULL,
    ADD CONSTRAINT profiles_friend_code_key UNIQUE (friend_code),
    ADD CONSTRAINT profiles_friend_code_check CHECK (friend_code ~ '^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$');

GRANT UPDATE (share_daily_summary) ON public.profiles TO authenticated;


-- ── 2. friendships ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.friendships (
    user_low   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_high  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- who added (the RATE_LIMIT counts these)
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (user_low, user_high),
    CONSTRAINT friendships_order_check CHECK (user_low < user_high)
);

CREATE INDEX IF NOT EXISTS friendships_user_high_idx ON public.friendships (user_high);
CREATE INDEX IF NOT EXISTS friendships_created_by_idx ON public.friendships (created_by, created_at);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friendships: select own"
    ON public.friendships
    FOR SELECT
    TO authenticated
    USING (auth.uid() IN (user_low, user_high));

REVOKE ALL ON public.friendships FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.friendships TO authenticated;


-- ── 3. Internal helpers ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public._are_friends(p_a UUID, p_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.friendships
        WHERE user_low = LEAST(p_a, p_b) AND user_high = GREATEST(p_a, p_b)
    );
$$;

REVOKE ALL ON FUNCTION public._are_friends(UUID, UUID) FROM PUBLIC, anon, authenticated;

-- Summary of a character's day: counts, hours and up to 3 skills of the completed quests. No titles or texts.
CREATE OR REPLACE FUNCTION public._day_summary(p_character_id UUID, p_date DATE)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    WITH q AS (
        SELECT q.status, q.hours, q.skill_name
        FROM public.quests q
        JOIN public.daily_plans p ON p.id = q.daily_plan_id
        WHERE p.character_id = p_character_id AND p.date = p_date
    )
    SELECT jsonb_build_object(
        'date',            p_date,
        'planned_count',   (SELECT count(*) FROM q),
        'completed_count', (SELECT count(*) FROM q WHERE status = 'completed'),
        'completed_hours', (SELECT COALESCE(round(sum(COALESCE(hours, 0)), 2), 0) FROM q WHERE status = 'completed'),
        'skills',          COALESCE((
            SELECT jsonb_agg(s.skill_name ORDER BY s.h DESC, s.skill_name)
            FROM (
                SELECT skill_name, sum(COALESCE(hours, 0)) AS h
                FROM q
                WHERE status = 'completed' AND skill_name IS NOT NULL
                GROUP BY skill_name
                ORDER BY h DESC, skill_name
                LIMIT 3
            ) s
        ), '[]'::jsonb)
    );
$$;

REVOKE ALL ON FUNCTION public._day_summary(UUID, DATE) FROM PUBLIC, anon, authenticated;

-- A friend card: only display fields (see the header). NULL when the user has no character.
CREATE OR REPLACE FUNCTION public._friend_card(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_char       RECORD;
    v_share      BOOLEAN;
    v_attributes JSONB;
    v_title      JSONB;
    v_streak     JSONB;
BEGIN
    SELECT c.id, c.name, c.class, c.level INTO v_char
    FROM public.characters c
    WHERE c.profile_id = p_user_id;
    IF v_char.id IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT share_daily_summary INTO v_share FROM public.profiles WHERE id = p_user_id;

    SELECT jsonb_object_agg(ad.code, COALESCE(ca.value, 0)) INTO v_attributes
    FROM public.attribute_definitions ad
    LEFT JOIN public.character_attributes ca
           ON ca.attribute_id = ad.id AND ca.character_id = v_char.id;

    -- the title skill: max level → total_xp → last practiced (same order as pickTitleSkill)
    SELECT jsonb_build_object(
               'name', cs.name, 'level', public._skill_level_for_xp(cs.total_xp), 'icon', cs.icon,
               'primary_attribute', ad.code)
    INTO v_title
    FROM public.character_skills cs
    LEFT JOIN public.attribute_definitions ad ON ad.id = cs.primary_attribute_id
    WHERE cs.character_id = v_char.id
    ORDER BY public._skill_level_for_xp(cs.total_xp) DESC, cs.total_xp DESC,
             cs.last_practiced_at DESC NULLS LAST, cs.id
    LIMIT 1;

    v_streak := public._streak_info(v_char.id);

    RETURN jsonb_build_object(
        'user_id',     p_user_id,
        'name',        v_char.name,
        'class',       v_char.class,
        'level',       v_char.level,
        'tier',        public._snapshot_tier(v_char.level),
        'aspect',      public._snapshot_aspect(v_attributes),
        'attributes',  COALESCE(v_attributes, '{}'::jsonb),
        'title_skill', v_title,
        'streak',      COALESCE((v_streak->>'current')::INT, 0),
        'today_done',  COALESCE((v_streak->>'today_done')::BOOLEAN, false),
        'summary',     CASE WHEN COALESCE(v_share, true)
                            THEN public._day_summary(v_char.id, (v_streak->>'today')::DATE)
                            ELSE NULL END
    );
END;
$$;

REVOKE ALL ON FUNCTION public._friend_card(UUID) FROM PUBLIC, anon, authenticated;


-- ── 4. RPCs ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.add_friend_by_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    c_friend_limit CONSTANT INT := 100;
    c_daily_adds   CONSTANT INT := 20;
    v_me     UUID := auth.uid();
    v_code   TEXT := upper(btrim(COALESCE(p_code, '')));
    v_friend UUID;
    v_name   TEXT;
BEGIN
    IF v_me IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'NOT_AUTHENTICATED';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.characters WHERE profile_id = v_me) THEN
        RAISE EXCEPTION USING MESSAGE = 'CHARACTER_NOT_FOUND';
    END IF;
    IF v_code !~ '^[A-Z0-9]{8}$' THEN
        RAISE EXCEPTION USING MESSAGE = 'INVALID_CODE';
    END IF;

    SELECT p.id, c.name INTO v_friend, v_name
    FROM public.profiles p
    JOIN public.characters c ON c.profile_id = p.id
    WHERE p.friend_code = v_code;
    IF v_friend IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'INVALID_CODE';
    END IF;
    IF v_friend = v_me THEN
        RAISE EXCEPTION USING MESSAGE = 'CANNOT_FRIEND_SELF';
    END IF;

    -- both profiles locked in a fixed order: parallel adds can't pass the limits together
    PERFORM 1 FROM public.profiles WHERE id IN (v_me, v_friend) ORDER BY id FOR UPDATE;

    IF public._are_friends(v_me, v_friend) THEN
        RETURN jsonb_build_object('friend_user_id', v_friend, 'name', v_name, 'already_friends', true);
    END IF;

    IF (SELECT count(*) FROM public.friendships WHERE v_me IN (user_low, user_high)) >= c_friend_limit
       OR (SELECT count(*) FROM public.friendships WHERE v_friend IN (user_low, user_high)) >= c_friend_limit THEN
        RAISE EXCEPTION USING MESSAGE = 'FRIEND_LIMIT';
    END IF;
    IF (SELECT count(*) FROM public.friendships
        WHERE created_by = v_me AND created_at > now() - INTERVAL '24 hours') >= c_daily_adds THEN
        RAISE EXCEPTION USING MESSAGE = 'RATE_LIMIT';
    END IF;

    INSERT INTO public.friendships (user_low, user_high, created_by)
    VALUES (LEAST(v_me, v_friend), GREATEST(v_me, v_friend), v_me);

    RETURN jsonb_build_object('friend_user_id', v_friend, 'name', v_name, 'already_friends', false);
END;
$$;

REVOKE ALL ON FUNCTION public.add_friend_by_code(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_friend_by_code(TEXT) TO authenticated;


CREATE OR REPLACE FUNCTION public.remove_friend(p_friend_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_me    UUID := auth.uid();
    v_count INT;
BEGIN
    IF v_me IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'NOT_AUTHENTICATED';
    END IF;
    DELETE FROM public.friendships
    WHERE user_low = LEAST(v_me, p_friend_user_id) AND user_high = GREATEST(v_me, p_friend_user_id);
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN jsonb_build_object('removed', v_count > 0);
END;
$$;

REVOKE ALL ON FUNCTION public.remove_friend(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.remove_friend(UUID) TO authenticated;


CREATE OR REPLACE FUNCTION public.regenerate_friend_code()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_me   UUID := auth.uid();
    v_code TEXT;
BEGIN
    IF v_me IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'NOT_AUTHENTICATED';
    END IF;
    LOOP
        BEGIN
            UPDATE public.profiles SET friend_code = public._new_friend_code(), updated_at = now()
            WHERE id = v_me
            RETURNING friend_code INTO v_code;
            EXIT;
        EXCEPTION WHEN unique_violation THEN
            -- a parallel profile took the same code between the check and the update: draw again
        END;
    END LOOP;
    IF v_code IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'PROFILE_NOT_FOUND';
    END IF;
    RETURN jsonb_build_object('code', v_code);
END;
$$;

REVOKE ALL ON FUNCTION public.regenerate_friend_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.regenerate_friend_code() TO authenticated;


CREATE OR REPLACE FUNCTION public.get_my_friend_code()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_row RECORD;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'NOT_AUTHENTICATED';
    END IF;
    SELECT friend_code, share_daily_summary INTO v_row FROM public.profiles WHERE id = auth.uid();
    IF v_row.friend_code IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'PROFILE_NOT_FOUND';
    END IF;
    RETURN jsonb_build_object('code', v_row.friend_code, 'share_daily_summary', v_row.share_daily_summary);
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_friend_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_friend_code() TO authenticated;


-- Friends sorted: done today first, then by streak, then by name.
CREATE OR REPLACE FUNCTION public.get_friends()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_me UUID := auth.uid();
BEGIN
    IF v_me IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'NOT_AUTHENTICATED';
    END IF;
    RETURN COALESCE((
        SELECT jsonb_agg(card ORDER BY (card->>'today_done')::BOOLEAN DESC, (card->>'streak')::INT DESC,
                                       card->>'name')
        FROM (
            SELECT public._friend_card(CASE WHEN f.user_low = v_me THEN f.user_high ELSE f.user_low END) AS card
            FROM public.friendships f
            WHERE v_me IN (f.user_low, f.user_high)
        ) t
        WHERE card IS NOT NULL
    ), '[]'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.get_friends() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_friends() TO authenticated;


-- A friend's profile: the card + longest streak, the week row and the summaries of the last 7 days
-- (days = null when the friend hides the summary).
CREATE OR REPLACE FUNCTION public.get_friend_profile(p_friend_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_me        UUID := auth.uid();
    v_card      JSONB;
    v_char_id   UUID;
    v_streak    JSONB;
    v_share     BOOLEAN;
    v_today     DATE;
    v_days      JSONB := '[]'::jsonb;
BEGIN
    IF v_me IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'NOT_AUTHENTICATED';
    END IF;
    IF p_friend_user_id IS NULL OR NOT public._are_friends(v_me, p_friend_user_id) THEN
        RAISE EXCEPTION USING MESSAGE = 'NOT_FRIENDS';
    END IF;

    v_card := public._friend_card(p_friend_user_id);
    IF v_card IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'NOT_FRIENDS';
    END IF;

    SELECT id INTO v_char_id FROM public.characters WHERE profile_id = p_friend_user_id;
    SELECT share_daily_summary INTO v_share FROM public.profiles WHERE id = p_friend_user_id;
    v_streak := public._streak_info(v_char_id);
    v_today := (v_streak->>'today')::DATE;

    IF COALESCE(v_share, true) THEN
        FOR i IN 0..6 LOOP
            v_days := v_days || jsonb_build_array(public._day_summary(v_char_id, v_today - i));
        END LOOP;
    END IF;

    RETURN v_card || jsonb_build_object(
        'longest', COALESCE((v_streak->>'longest')::INT, 0),
        'week',    COALESCE(v_streak->'week', '[]'::jsonb),
        'days',    CASE WHEN COALESCE(v_share, true) THEN v_days ELSE NULL END
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_friend_profile(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_friend_profile(UUID) TO authenticated;
