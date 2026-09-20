-- Migration: Add XP reward and attribute link to quests
-- This enables quests to award XP when completed and optionally
-- link to a character attribute for growth tracking.

ALTER TABLE quests
  ADD COLUMN IF NOT EXISTS xp_reward integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS attribute_id uuid REFERENCES attribute_definitions(id) ON DELETE SET NULL;

COMMENT ON COLUMN quests.xp_reward IS 'Amount of XP awarded to the character when this quest is completed.';
COMMENT ON COLUMN quests.attribute_id IS 'Optional link to an attribute_definitions row -- which attribute grows when this quest is completed.';
