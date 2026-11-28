import { useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";

import { profileRepository } from "@/entities/profile/api/profileRepository";
import type { Profile } from "@/entities/profile/model/profileTypes";
import { profileQueryKey } from "@/entities/profile/model/useProfile";
import { useNotifications } from "@/shared/lib/notifications/context";

import styles from "../SettingsPage.module.scss";
import { SettingsSection } from "./SettingsSection";

/** «Приватность»: whether friends see the summary of my day (profiles.share_daily_summary) */
export function PrivacySection({ userId, profile }: { userId: string; profile: Profile }) {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  const id = useId();
  const [saving, setSaving] = useState(false);
  const checked = profile.shareDailySummary;

  async function toggle(next: boolean) {
    setSaving(true);
    try {
      await profileRepository.updateShareDailySummary(userId, next);
      await queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) });
      // friends lists are cached per viewer; mine doesn't change, nothing else to refresh
      notify(next ? "Друзья видят сводку дня" : "Сводка дня скрыта от друзей", "success");
    } catch {
      notify("Не удалось сохранить — проверь связь", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsSection id="privacy" title="Приватность">
      <div className={styles.switchRow}>
        <label htmlFor={id} className={styles.label}>
          Показывать друзьям сводку дня
        </label>
        <input
          id={id}
          type="checkbox"
          role="switch"
          className={styles.switch}
          checked={checked}
          disabled={saving}
          onChange={(e) => void toggle(e.target.checked)}
          aria-describedby={`${id}-hint`}
          data-testid="share-summary-toggle"
        />
      </div>
      <p id={`${id}-hint`} className={styles.hint}>
        Сколько дел из плана сделано, сколько часов и в каких навыках. Тексты отчётов, планы и
        названия квестов друзья не видят никогда.
      </p>
    </SettingsSection>
  );
}
