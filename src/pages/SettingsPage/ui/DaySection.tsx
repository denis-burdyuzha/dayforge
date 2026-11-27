import { useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";

import { profileRepository } from "@/entities/profile/api/profileRepository";
import { DAY_START_OPTIONS, type Profile } from "@/entities/profile/model/profileTypes";
import { profileQueryKey } from "@/entities/profile/model/useProfile";

import styles from "../SettingsPage.module.scss";
import { SettingsSection } from "./SettingsSection";

/** «Мой день»: when the user's day starts */
export function DaySection({ userId, profile }: { userId: string; profile: Profile }) {
  const queryClient = useQueryClient();
  const selectId = useId();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function changeDayStart(value: string) {
    setSaving(true);
    setMessage(null);
    try {
      await profileRepository.updateDayStartTime(userId, value);
      await queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) });
      setMessage("Сохранено");
    } catch {
      setMessage("Не удалось сохранить — проверь соединение и попробуй ещё раз");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsSection id="day" title="Мой день">
      <label htmlFor={selectId} className={styles.label}>
        Мой день начинается в
      </label>
      <select
        id={selectId}
        className={styles.select}
        value={profile.dayStartTime}
        disabled={saving}
        onChange={(e) => void changeDayStart(e.target.value)}
      >
        {DAY_START_OPTIONS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <p className={styles.hint}>
        До этого времени ночь считается предыдущим днём: план, отчёт, календарь и XP за день.
      </p>
      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}
    </SettingsSection>
  );
}
