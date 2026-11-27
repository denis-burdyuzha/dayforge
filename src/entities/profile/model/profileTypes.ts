export interface Profile {
  id: string;
  username: string | null;
  displayName: string | null;
  /** local "HH:MM" the user's day starts at (00:00–06:00, step 30) */
  dayStartTime: string;
  /** IANA zone of the device, updated on app entry; null = unknown */
  timezone: string | null;
}
