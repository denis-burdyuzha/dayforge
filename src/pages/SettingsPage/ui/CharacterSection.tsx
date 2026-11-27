import { useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";

import { characterRepository } from "@/entities/character/api/characterRepository";
import {
  CHARACTER_NAME_MAX,
  characterNameErrorMessage,
  characterNameSchema,
} from "@/entities/character/model/characterName";
import { characterQueryKey, useCharacter } from "@/entities/character/model/useCharacter";
import { useNotifications } from "@/shared/lib/notifications/context";
import { Button } from "@/shared/ui/Button/ui/Button";

import styles from "../SettingsPage.module.scss";
import { SettingsSection } from "./SettingsSection";

/** «Персонаж»: the character name (rename_character; the server also checks banned words) */
export function CharacterSection({ userId }: { userId: string }) {
  const { data: character } = useCharacter(userId);
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  const inputId = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const value = draft ?? character?.name ?? "";
  const changed = character !== undefined && character !== null && value.trim() !== character.name;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = characterNameSchema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Проверь имя");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await characterRepository.renameCharacter(parsed.data);
      await queryClient.invalidateQueries({ queryKey: characterQueryKey(userId) });
      setDraft(null);
      notify("Имя сохранено", "success");
    } catch (err) {
      setError(characterNameErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsSection id="character" title="Персонаж">
      <form className={styles.inlineForm} onSubmit={(e) => void save(e)}>
        <label htmlFor={inputId} className={styles.label}>
          Имя персонажа
        </label>
        <input
          id={inputId}
          className={styles.input}
          value={value}
          maxLength={CHARACTER_NAME_MAX + 5}
          onChange={(e) => {
            setDraft(e.target.value);
            setError(null);
          }}
          aria-invalid={error !== null}
          aria-describedby={error ? `${inputId}-error` : undefined}
          autoComplete="off"
          data-testid="character-name-input"
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className={styles.fieldError}
            role="alert"
            data-testid="character-name-error"
          >
            {error}
          </p>
        )}
        <Button
          type="submit"
          variant="secondary"
          fullWidth
          disabled={!changed || saving}
          data-testid="character-name-save"
        >
          {saving ? "Сохраняю…" : "Сохранить имя"}
        </Button>
      </form>
    </SettingsSection>
  );
}
