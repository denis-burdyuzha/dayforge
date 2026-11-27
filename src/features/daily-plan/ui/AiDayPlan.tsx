import type { SkillView } from "@/entities/character/model/skillPresentation";
import {
  type ApplyDayPlanResult,
  DAY_PLAN_LIMITS,
  type DayPlanError,
  formatDuration,
  type TimedEntry,
} from "@/entities/daily-plan/model/aiDayPlan";
import { Button } from "@/shared/ui/Button/ui/Button";
import { Loading } from "@/shared/ui/Loading/ui/Loading";

import { useAiDayPlan } from "../model/useAiDayPlan";
import styles from "./AiDayPlan.module.scss";
import { PlanItemCard } from "./PlanItemCard";

interface AiDayPlanProps {
  planDate: string;
  /** the user's day boundary ("HH:MM") */
  dayStartTime: string;
  skills: SkillView[];
  existingQuests: ReadonlyArray<TimedEntry>;
  onApplied: (result: ApplyDayPlanResult) => void | Promise<void>;
  /** scroll to / open the manual quest form */
  onManual: () => void;
}

function ErrorBanner({
  error,
  onRetry,
  onManual,
  onDismiss,
}: {
  error: DayPlanError;
  onRetry: (() => void) | null;
  onManual: () => void;
  onDismiss: () => void;
}) {
  let title: string;
  let text: string | null;
  let manual = false;
  switch (error.code) {
    case "RATE_LIMIT":
      title = "Лимит разборов плана на сегодня исчерпан";
      text = "Добавь квесты вручную — форма ниже.";
      manual = true;
      onRetry = null;
      break;
    case "AI_TIMEOUT":
    case "AI_INVALID_OUTPUT":
    case "AI_ERROR":
      title = "Не удалось составить план";
      text = "Попробуй ещё раз или добавь квесты вручную.";
      manual = true;
      break;
    case "NETWORK":
      title = "Нет сети";
      text = "Черновик сохранён — повтори, когда появится соединение.";
      break;
    case "PLAN_HOURS_LIMIT": {
      const total = error.details?.totalMinutes;
      const existing = error.details?.existingMinutes;
      title = `В плане получается ${typeof total === "number" ? formatDuration(total) : "больше 16 ч"} — максимум ${DAY_PLAN_LIMITS.planMinutesMax / 60} ч`;
      text = `${typeof existing === "number" && existing > 0 ? `Уже запланировано: ${formatDuration(existing)}. ` : ""}Сократи длительность или выключи часть пунктов.`;
      onRetry = null;
      break;
    }
    case "INVALID_INPUT":
      title = "Проверь текст";
      text = error.message;
      onRetry = null;
      break;
    default:
      title = "Не удалось сохранить план";
      text = `Код ошибки: ${error.code}`;
  }
  return (
    <div className={styles.errorBanner} role="alert" data-error-code={error.code}>
      <p className={styles.errorTitle}>{title}</p>
      {text && <p className={styles.errorText}>{text}</p>}
      <div className={styles.errorActions}>
        {onRetry && (
          <Button size="sm" onClick={onRetry}>
            Повторить
          </Button>
        )}
        {manual && (
          <button type="button" className={styles.linkButton} onClick={onManual}>
            Добавить вручную
          </button>
        )}
        <button type="button" className={styles.linkButton} onClick={onDismiss}>
          Скрыть
        </button>
      </div>
    </div>
  );
}

/** Morning plan: free text → AI parse → editable preview → apply_day_plan (quests with time on the date) */
export function AiDayPlan({
  planDate,
  dayStartTime,
  skills,
  existingQuests,
  onApplied,
  onManual,
}: AiDayPlanProps) {
  const flow = useAiDayPlan({ planDate, dayStartTime, existingQuests, onApplied });

  if (flow.phase === "parsing") {
    return (
      <section className={styles.section}>
        <div className={styles.center}>
          <Loading label="Составляю план…" />
        </div>
      </section>
    );
  }

  if (flow.phase === "input") {
    const length = flow.text.trim().length;
    return (
      <section className={styles.section} aria-label="План текстом">
        <label className={styles.sectionTitle} htmlFor="ai-day-plan-text">
          Опиши план на день
        </label>
        {flow.error && (
          <ErrorBanner
            error={flow.error}
            onRetry={() => void flow.parse()}
            onManual={onManual}
            onDismiss={flow.dismissError}
          />
        )}
        <textarea
          id="ai-day-plan-text"
          className={styles.textarea}
          value={flow.text}
          onChange={(e) => flow.setText(e.target.value)}
          maxLength={DAY_PLAN_LIMITS.textMax}
          placeholder="Например: в 7 пробежка 30 минут, потом работа до 6, вечером английский и купить продукты."
          data-testid="day-plan-text"
        />
        <p className={styles.counter}>
          {length}/{DAY_PLAN_LIMITS.textMax} · черновик сохраняется автоматически
        </p>
        <Button
          fullWidth
          onClick={() => void flow.parse()}
          disabled={!flow.canParse}
          data-testid="parse-plan-btn"
        >
          ✦ Составить план
        </Button>
      </section>
    );
  }

  // preview / applying
  const applying = flow.phase === "applying";
  return (
    <section className={styles.section} aria-label="Предпросмотр плана">
      <h2 className={styles.sectionTitle}>Проверь план</h2>
      <p className={styles.subtitle}>
        Поправь время, длительность и навыки. В план попадут только отмеченные пункты.
      </p>

      {flow.items.length === 0 ? (
        <p className={styles.empty}>
          В тексте не нашлось пунктов плана. Допиши текст или добавь квест вручную.
        </p>
      ) : (
        <div className={styles.cards}>
          {flow.items.map((item, i) => (
            <PlanItemCard
              key={item.key}
              item={item}
              skills={skills}
              overlapsWith={flow.overlaps.get(item.key)}
              invalidMessage={flow.invalid[i] ?? null}
              onChange={(patch) => flow.updateItem(item.key, patch)}
              onTimeCommitted={flow.resort}
            />
          ))}
        </div>
      )}

      <footer className={styles.summary}>
        {/* errors of «Добавить в план» show next to the button the user just pressed */}
        {flow.error && (
          <ErrorBanner
            error={flow.error}
            onRetry={flow.error.code === "NETWORK" ? () => void flow.confirm() : null}
            onManual={onManual}
            onDismiss={flow.dismissError}
          />
        )}
        <p className={styles.summaryLine} data-testid="plan-summary">
          {flow.enabledCount} {pluralItems(flow.enabledCount)} · {formatDuration(flow.minutes)}
        </p>
        <Button
          fullWidth
          size="lg"
          onClick={() => void flow.confirm()}
          disabled={!flow.canConfirm || applying}
          data-testid="apply-plan-btn"
        >
          {applying ? "Добавляю…" : "Добавить в план"}
        </Button>
        <button
          type="button"
          className={styles.linkButton}
          onClick={flow.backToText}
          disabled={applying}
        >
          ← Изменить текст
        </button>
      </footer>
    </section>
  );
}

function pluralItems(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "пункт";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "пункта";
  return "пунктов";
}
