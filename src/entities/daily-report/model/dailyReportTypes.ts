export interface DailyReport {
  id: string;
  characterId: string;
  date: string;
  content: string;
  createdAt: string;
}

export interface AttributeDelta {
  attributeId: string;
  code: string;
  name: string;
  delta: number;
}

export interface DayCompletionResult {
  report: DailyReport;
  totalXpGained: number;
  attributeDeltas: AttributeDelta[];
  /** true if completing the day caused a level-up */
  leveledUp: boolean;
  newLevel: number;
}
