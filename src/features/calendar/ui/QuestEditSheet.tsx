import { useId, useState } from "react";

import type { SkillView } from "@/entities/character/model/skillPresentation";
import { DURATION_LIMITS } from "@/entities/daily-plan/model/calendar";
import type { QuestUpdateInput } from "@/entities/daily-plan/model/dailyPlanTypes";
import { Button } from "@/shared/ui/Button/ui/Button";
import { Drawer } from "@/shared/ui/Drawer/ui/Drawer";

import styles from "./Calendar.module.scss";

/** What the card edits: an existing quest (with id and status) or a new one */
export interface QuestDraft extends QuestUpdateInput {
  id: string | null;
  status: "pending" | "completed";
}

interface QuestEditSheetProps {
  draft: QuestDraft | null;
  skills: SkillView[];
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (input: QuestUpdateInput) => void;
  onDelete: () => void;
  onComplete: () => void;
}

/**
 * Bottom card of a quest: title, date, start, duration (5–480, step 5), skill (an existing one or none), «Выполнено»,
 * «Удалить». A completed quest: only the title is editable, «Удалить» is hidden (the update_quest rules).
 */
export function QuestEditSheet(props: QuestEditSheetProps) {
  return (
    <Drawer
      open={props.draft !== null}
      onClose={props.onClose}
      side="bottom"
      title={props.draft?.id ? "Квест" : "Новый квест"}
    >
      {props.draft && <QuestForm key={props.draft.id ?? "new"} {...props} draft={props.draft} />}
    </Drawer>
  );
}

/** the focused field stays visible above the on-screen keyboard (the sheet scrolls inside) */
function keepVisible(e: React.FocusEvent<HTMLElement>) {
  const el = e.currentTarget;
  window.setTimeout(() => el.scrollIntoView({ block: "center", behavior: "smooth" }), 250);
}

function QuestForm({
  draft,
  skills,
  busy,
  error,
  onSave,
  onDelete,
  onComplete,
}: QuestEditSheetProps & { draft: QuestDraft }) {
  const ids = {
    title: useId(),
    date: useId(),
    time: useId(),
    duration: useId(),
    skill: useId(),
  };
  const [title, setTitle] = useState(draft.title);
  const [date, setDate] = useState(draft.date);
  const [startTime, setStartTime] = useState(draft.startTime ?? "");
  const [duration, setDuration] = useState(
    draft.durationMinutes != null ? String(draft.durationMinutes) : "",
  );
  const [skillId, setSkillId] = useState(draft.skillId ?? "");

  const completed = draft.status === "completed";
  const minutes = duration.trim() === "" ? null : Number(duration);
  const titleOk = title.trim().length >= 1 && title.trim().length <= 120;
  const durationOk =
    minutes === null ||
    (Number.isInteger(minutes) &&
      minutes >= DURATION_LIMITS.min &&
      minutes <= DURATION_LIMITS.max &&
      minutes % DURATION_LIMITS.step === 0);
  const valid = titleOk && durationOk && date !== "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || busy) return;
    onSave({
      title: title.trim(),
      date,
      startTime: startTime === "" ? null : startTime,
      durationMinutes: minutes,
      skillId: skillId === "" ? null : skillId,
    });
  }

  return (
    <form className={styles.sheetForm} onSubmit={submit} data-testid="quest-sheet">
      {completed && (
        <p className={styles.sheetNote}>Квест выполнен — можно изменить только название.</p>
      )}
      <label className={styles.field} htmlFor={ids.title}>
        <span>Название</span>
        <input
          id={ids.title}
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={keepVisible}
          autoFocus={!draft.id}
          data-testid="sheet-title"
        />
      </label>
      <div className={styles.fieldRow}>
        <label className={styles.field} htmlFor={ids.date}>
          <span>Дата</span>
          <input
            id={ids.date}
            type="date"
            value={date}
            disabled={completed}
            onChange={(e) => setDate(e.target.value)}
            onFocus={keepVisible}
            data-testid="sheet-date"
          />
        </label>
        <label className={styles.field} htmlFor={ids.time}>
          <span>Начало</span>
          <input
            id={ids.time}
            type="time"
            step={300}
            value={startTime}
            disabled={completed}
            onChange={(e) => setStartTime(e.target.value)}
            onFocus={keepVisible}
            data-testid="sheet-time"
          />
        </label>
      </div>
      <label className={styles.field} htmlFor={ids.duration}>
        <span>Длительность, мин</span>
        <input
          id={ids.duration}
          type="number"
          inputMode="numeric"
          min={DURATION_LIMITS.min}
          max={DURATION_LIMITS.max}
          step={DURATION_LIMITS.step}
          value={duration}
          disabled={completed}
          onChange={(e) => setDuration(e.target.value)}
          onFocus={keepVisible}
          aria-invalid={!durationOk}
          data-testid="sheet-duration"
        />
      </label>
      <label className={styles.field} htmlFor={ids.skill}>
        <span>Навык</span>
        <select
          id={ids.skill}
          value={skillId}
          disabled={completed}
          onChange={(e) => setSkillId(e.target.value)}
          onFocus={keepVisible}
          data-testid="sheet-skill"
        >
          <option value="">Без навыка (0 XP)</option>
          {skills.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      {!durationOk && (
        <p className={styles.sheetError}>
          Длительность — от {DURATION_LIMITS.min} до {DURATION_LIMITS.max} минут, шаг{" "}
          {DURATION_LIMITS.step}.
        </p>
      )}
      {error && (
        <p className={styles.sheetError} role="alert" data-testid="sheet-error">
          {error}
        </p>
      )}

      <div className={styles.sheetActions}>
        <Button type="submit" fullWidth disabled={!valid || busy} data-testid="sheet-save">
          {busy ? "Сохраняю…" : "Сохранить"}
        </Button>
        {draft.id && !completed && (
          <>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onComplete}
              disabled={busy}
              data-testid="sheet-complete"
            >
              ✓ Выполнено
            </Button>
            <Button
              type="button"
              variant="danger"
              fullWidth
              onClick={onDelete}
              disabled={busy}
              data-testid="sheet-delete"
            >
              Удалить
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
