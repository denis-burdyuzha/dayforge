-- ============================================================
-- Migration: Add skill_name and hours fields to quests
--
-- skill_name: stores the user-entered skill name for lookup/display
--             (the RPC will upsert into character_skills using this name)
-- hours: how many hours this quest represents for skill practice
-- ============================================================

ALTER TABLE public.quests
    ADD COLUMN IF NOT EXISTS skill_name text,
    ADD COLUMN IF NOT EXISTS hours numeric;

COMMENT ON COLUMN public.quests.skill_name IS
    'User-entered skill name. RPC complete_quest will upsert into character_skills on completion.';

COMMENT ON COLUMN public.quests.hours IS
    'Hours of practice credited to the linked skill upon quest completion.';
