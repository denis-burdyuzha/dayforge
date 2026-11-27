export interface Profile {
  id: string;
  username: string | null;
  displayName: string | null;
  /** local "HH:MM" the user's day starts at (00:00–06:00, step 30) */
  dayStartTime: string;
  /** IANA zone of the device, updated on app entry; null = unknown */
  timezone: string | null;
}

/** Choices of «Мой день начинается в»: 00:00 … 06:00, step 30 minutes */
export const DAY_START_OPTIONS: readonly string[] = Array.from({ length: 13 }, (_, i) => {
  const minutes = i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});
