/**
 * Result of a quest completion as returned by RPC complete_quest — and, summed over all events, by
 * apply_day_report (same fields, plus its own extras).
 */
export interface QuestCompletionResult {
  xpAwarded: number;
  oldLevel: number;
  newLevel: number;
  attributeGained: number;
  skillXpGained: number;
  skillLevel: number;
}
