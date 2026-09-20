-- ============================================================
-- Migration: Add character_skills table
--
-- This replaces the old user_skills (catalog-based) for tracking
-- user-defined skills with hours, XP, and form (decay-based).
-- ============================================================

CREATE TABLE public.character_skills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,

    -- Skill name as entered by the user (stored lowercase for dedup, displayed as-is)
    name text NOT NULL,

    -- Cumulative hours practiced (fractional OK, e.g. 1.5 hours)
    total_hours numeric NOT NULL DEFAULT 0,

    -- Cumulative XP earned for this skill
    total_xp integer NOT NULL DEFAULT 0,

    -- When the skill was last practiced (NULL = never practiced yet)
    last_practiced_at timestamptz,

    created_at timestamptz NOT NULL DEFAULT now(),

    -- Uniqueness: one skill name per character (case-insensitive)
    CONSTRAINT character_skills_unique
        UNIQUE (character_id, name),

    CONSTRAINT character_skills_total_hours_check
        CHECK (total_hours >= 0),

    CONSTRAINT character_skills_total_xp_check
        CHECK (total_xp >= 0)
);

CREATE INDEX character_skills_character_id_idx
    ON public.character_skills(character_id);


-- ── RLS ───────────────────────────────────────────────────────────────

ALTER TABLE public.character_skills ENABLE ROW LEVEL SECURITY;

-- Users can only see their own character's skills
CREATE POLICY "character_skills: select own"
    ON public.character_skills
    FOR SELECT
    USING (
        character_id IN (
            SELECT id FROM public.characters
            WHERE profile_id = auth.uid()
        )
    );

-- Users can insert skills only for their own character
CREATE POLICY "character_skills: insert own"
    ON public.character_skills
    FOR INSERT
    WITH CHECK (
        character_id IN (
            SELECT id FROM public.characters
            WHERE profile_id = auth.uid()
        )
    );

-- Users can update their own character's skills
CREATE POLICY "character_skills: update own"
    ON public.character_skills
    FOR UPDATE
    USING (
        character_id IN (
            SELECT id FROM public.characters
            WHERE profile_id = auth.uid()
        )
    );

-- Users can delete their own character's skills
CREATE POLICY "character_skills: delete own"
    ON public.character_skills
    FOR DELETE
    USING (
        character_id IN (
            SELECT id FROM public.characters
            WHERE profile_id = auth.uid()
        )
    );
