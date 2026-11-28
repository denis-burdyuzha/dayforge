-- Invite preview for /invite/:code — the only friends function open to anon.
-- get_invite_preview(code) → { name, class } of the code's owner (character name + class, nothing else) or null
-- (bad / unknown code, no character yet). Case and spaces don't matter.
-- No rate limit is possible for anon here; a code has 31^8 ≈ 8.5·10^11 values and gives away only a name.
CREATE OR REPLACE FUNCTION public.get_invite_preview(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_code TEXT := upper(btrim(COALESCE(p_code, '')));
    v_row  RECORD;
BEGIN
    IF v_code !~ '^[A-Z0-9]{8}$' THEN
        RETURN NULL;
    END IF;
    SELECT c.name, c.class INTO v_row
    FROM public.profiles p
    JOIN public.characters c ON c.profile_id = p.id
    WHERE p.friend_code = v_code;
    IF v_row.name IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN jsonb_build_object('name', v_row.name, 'class', v_row.class);
END;
$$;

REVOKE ALL ON FUNCTION public.get_invite_preview(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invite_preview(TEXT) TO anon, authenticated;
