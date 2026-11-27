import { useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";

import { useAppState } from "@/entities/auth/model/useAppState";
import { profileRepository } from "@/entities/profile/api/profileRepository";
import { DAY_START_OPTIONS } from "@/entities/profile/model/profileTypes";
import { profileQueryKey, useProfile } from "@/entities/profile/model/useProfile";
import { Card } from "@/shared/ui/Card/ui/Card";
import { Loading } from "@/shared/ui/Loading/ui/Loading";

import styles from "./SettingsPage.module.scss";

export function SettingsPage() {
  const { session } = useAppState();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile(userId);
  const selectId = useId();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function changeDayStart(value: string) {
    if (!userId) return;
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

  if (isLoading || !profile) {
    return (
      <div className={styles.center}>
        <Loading label="Загружаем настройки…" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Настройки</h1>
      <Card className={styles.card}>
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
      </Card>
    </div>
  );
}
