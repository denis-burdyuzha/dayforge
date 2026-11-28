-- ============================================================
-- Migration: character name rules, banned words, rename_character
-- ============================================================
-- Name rules (client and server): 2–20 characters after trim; letters of any alphabet, digits, space, «-», «_»;
-- no double spaces → INVALID_NAME. A name whose normalised form contains a banned root → NAME_NOT_ALLOWED.
-- Normalisation (names and banned roots alike): lower case, ё→е, Latin look-alikes → Cyrillic (a c e o p x y k m t h
-- b, 0→о, 3→з), everything that is not a letter dropped — so «С у к а», «cyka», «Сук-а» are caught.
-- Existing names are not touched; the rules apply on onboarding and on rename.

-- ── Banned roots ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.banned_words (
    word TEXT PRIMARY KEY
);

ALTER TABLE public.banned_words ENABLE ROW LEVEL SECURITY;
-- no policies: clients see nothing (only SECURITY DEFINER functions read it)
REVOKE ALL ON public.banned_words FROM anon, authenticated;
GRANT ALL ON public.banned_words TO service_role;

CREATE OR REPLACE FUNCTION public._normalize_name_for_ban(p_text TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
    SELECT regexp_replace(
        translate(replace(lower(COALESCE(p_text, '')), 'ё', 'е'), 'aceopxykmthb03', 'асеорхукмтнвоз'),
        '[^[:alpha:]]', '', 'g')
$$;

REVOKE ALL ON FUNCTION public._normalize_name_for_ban(TEXT) FROM PUBLIC, anon, authenticated;

-- the most common Russian and English obscenities / insults (roots; stored normalised). Short roots that occur
-- inside ordinary names are left out on purpose (лох → «Лохматый», манда → «Командарм», ass, cock, dick, rape).
INSERT INTO public.banned_words (word)
SELECT DISTINCT public._normalize_name_for_ban(w)
FROM unnest(ARRAY[
    -- Russian
    'хуй', 'хуе', 'хуя', 'хуи', 'пизд', 'пезд', 'ебат', 'ебан', 'ебал', 'ебло', 'ебуч', 'уебок', 'уебищ',
    'заеб', 'выеб', 'наеб', 'долбоеб', 'бляд', 'блят', 'сука', 'суки', 'сучк', 'мудак', 'мудил', 'мудоз',
    'пидор', 'пидар', 'пидр', 'педик', 'гандон', 'гондон', 'залуп', 'дроч', 'шлюх', 'шалав', 'мразь', 'ублюд',
    'дебил', 'кретин', 'говно', 'говнюк', 'жопа', 'срань',
    -- English
    'fuck', 'shit', 'bitch', 'cunt', 'whore', 'slut', 'faggot', 'nigger', 'nigga', 'bastard', 'asshole',
    'retard', 'wanker', 'twat', 'pussy', 'dickhead', 'porn', 'hitler'
]) w
ON CONFLICT (word) DO NOTHING;

-- ── Name check ──────────────────────────────────────────────────────────────
-- Returns the trimmed name or raises INVALID_NAME / NAME_NOT_ALLOWED. Internal.
CREATE OR REPLACE FUNCTION public._check_character_name(p_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_name       TEXT := btrim(COALESCE(p_name, ''));
    v_normalized TEXT;
BEGIN
    IF char_length(v_name) < 2 OR char_length(v_name) > 20
       OR v_name !~ '^[[:alpha:][:digit:] _-]+$'
       OR position('  ' IN v_name) > 0 THEN
        RAISE EXCEPTION USING MESSAGE = 'INVALID_NAME';
    END IF;

    v_normalized := public._normalize_name_for_ban(v_name);
    IF EXISTS (SELECT 1 FROM public.banned_words b WHERE position(b.word IN v_normalized) > 0) THEN
        RAISE EXCEPTION USING MESSAGE = 'NAME_NOT_ALLOWED';
    END IF;

    RETURN v_name;
END;
$$;

REVOKE ALL ON FUNCTION public._check_character_name(TEXT) FROM PUBLIC, anon, authenticated;

-- ── rename_character ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rename_character(p_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_character_id UUID := public._current_character_id();
    v_name         TEXT := public._check_character_name(p_name);
BEGIN
    UPDATE public.characters SET name = v_name, updated_at = now() WHERE id = v_character_id;
    RETURN jsonb_build_object('name', v_name);
END;
$$;

REVOKE ALL ON FUNCTION public.rename_character(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rename_character(TEXT) TO authenticated;

-- ── complete_onboarding: the same name rules ────────────────────────────────
-- Same as 20261127150000 plus the name check (INVALID_NAME / NAME_NOT_ALLOWED) before anything is written.
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
    v_character_name     TEXT;
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

    v_character_name := public._check_character_name(p_character_name);

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
    VALUES (v_user_id, v_character_name, p_class_id)
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
