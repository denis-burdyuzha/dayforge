import { useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";

import { profileRepository } from "@/entities/profile/api/profileRepository";
import {
  BEDTIME_OPTIONS,
  type BedtimeChoice,
  bedtimeToDayStart,
  dayStartExplanation,
  dayStartToBedtime,
  isBedtimeChoice,
} from "@/entities/profile/model/bedtime";
import type { Profile } from "@/entities/profile/model/profileTypes";
import { profileQueryKey } from "@/entities/profile/model/useProfile";
import { useNotifications } from "@/shared/lib/notifications/context";

import styles from "../SettingsPage.module.scss";
import { SettingsSection } from "./SettingsSection";

const CHOICE_KEY = "dayforge:bedtime-choice";

/** The bedtime the user picked last on this device (storage may be unavailable) */
function loadChoice(): BedtimeChoice | null {
  try {
    const value = window.localStorage.getItem(CHOICE_KEY);
    return isBedtimeChoice(value) ? value : null;
  } catch {
    return null;
  }
}

function saveChoice(choice: BedtimeChoice) {
  try {
    window.localStorage.setItem(CHOICE_KEY, choice);
  } catch {
    /* the choice is then recovered from the boundary alone */
  }
}

/** «Мой день»: the bedtime question that sets profiles.day_start_time */
export function DaySection({ userId, profile }: { userId: string; profile: Profile }) {
  const queryClient = useQueryClient();
  const selectId = useId();
  const [saving, setSaving] = useState(false);
  const [remembered, setRemembered] = useState(loadChoice);
  const { notify } = useNotifications();

  const choice = dayStartToBedtime(profile.dayStartTime, remembered);

  async function change(next: BedtimeChoice) {
    setSaving(true);
    try {
      await profileRepository.updateDayStartTime(userId, bedtimeToDayStart(next));
      saveChoice(next);
      setRemembered(next);
      await queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) });
      notify("Сохранено", "success");
    } catch {
      notify("Не удалось сохранить — проверь соединение", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsSection id="day" title="Мой день">
      <label htmlFor={selectId} className={styles.label}>
        Во сколько ты обычно ложишься спать?
      </label>
      <select
        id={selectId}
        className={styles.select}
        value={choice}
        disabled={saving}
        onChange={(e) => {
          if (isBedtimeChoice(e.target.value)) void change(e.target.value);
        }}
        data-testid="bedtime-select"
      >
        {BEDTIME_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <p className={styles.hint} data-testid="bedtime-hint">
        {dayStartExplanation(choice)}
      </p>
    </SettingsSection>
  );
}
