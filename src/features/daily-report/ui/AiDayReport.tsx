import { Link } from "react-router-dom";

import type { SkillView } from "@/entities/character/model/skillPresentation";
import {
  type ApplyDayReportResult,
  DAY_REPORT_LIMITS,
  type DayReportError,
  estimateCharacterXp,
} from "@/entities/daily-report/model/aiDayReport";
import { Button } from "@/shared/ui/Button/ui/Button";
import { Loading } from "@/shared/ui/Loading/ui/Loading";

import { useAiDayReport } from "../model/useAiDayReport";
import styles from "./AiDayReport.module.scss";
import { DayEventCard } from "./DayEventCard";

interface AiDayReportProps {
  reportDate: string;
  skills: SkillView[];
  /** pending quests of the day: id → title (for the «Из плана» label) */
  plannedQuestTitles: ReadonlyMap<string, string>;
  onApplied: (result: ApplyDayReportResult, text: string) => void | Promise<void>;
  /** the old flow: save the text without AI parsing */
  onCompleteWithoutParsing: (text: string) => void;
  completingWithoutParsing: boolean;
}

const MANUAL_PATH = "/app/plan";

function formatHours(h: unknown) {
  return typeof h === "number" ? `${Math.round(h * 10) / 10} ч` : "";
}

function ErrorBanner({
  error,
  onRetry,
  onDismiss,
}: {
  error: DayReportError;
  onRetry: (() => void) | null;
  onDismiss: () => void;
}) {
  let title: string;
  let text: string | null;
  let manual = false;
  switch (error.code) {
    case "RATE_LIMIT":
      title = "Лимит разборов на сегодня исчерпан";
      text = "Отметь сделанное вручную — квесты на странице плана.";
      manual = true;
      onRetry = null;
      break;
    case "AI_TIMEOUT":
    case "AI_INVALID_OUTPUT":
    case "AI_ERROR":
      title = "Не удалось разобрать день";
      text = "Попробуй ещё раз или отметь сделанное вручную.";
      manual = true;
      break;
    case "NETWORK":
      title = "Нет сети";
      text = "Черновик сохранён — повтори, когда появится соединение.";
      break;
    case "DAY_HOURS_LIMIT": {
      const total = formatHours(error.details?.totalHours);
      const already = formatHours(error.details?.alreadyHours);
      title = `За день получается ${total || "больше 16 ч"} — максимум ${DAY_REPORT_LIMITS.dayHoursMax} ч`;
      text = `${already ? `Уже начислено за дату: ${already}. ` : ""}Уменьши часы или выключи часть событий.`;
      onRetry = null;
      break;
    }
    case "INVALID_INPUT":
      title = "Проверь текст";
      text = error.message;
      onRetry = null;
      break;
    default:
      title = "Не удалось сохранить";
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
          <Link className={styles.linkButton} to={MANUAL_PATH}>
            Отметить вручную
          </Link>
        )}
        <button type="button" className={styles.linkButton} onClick={onDismiss}>
          Скрыть
        </button>
      </div>
    </div>
  );
}

/** Evening report: free text → AI parse → editable preview → apply_day_report */
export function AiDayReport({
  reportDate,
  skills,
  plannedQuestTitles,
  onApplied,
  onCompleteWithoutParsing,
  completingWithoutParsing,
}: AiDayReportProps) {
  const flow = useAiDayReport({ reportDate, onApplied });

  if (flow.phase === "parsing") {
    return (
      <div className={styles.center}>
        <Loading label="Разбираю день…" />
      </div>
    );
  }

  if (flow.phase === "input") {
    const length = flow.text.trim().length;
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Как прошёл твой день?</h1>
          <p className={styles.subtitle}>
            Напиши свободным текстом, чем занимался и сколько примерно времени — я разберу события и
            навыки, а ты проверишь перед начислением.
          </p>
        </header>

        {flow.error && (
          <ErrorBanner
            error={flow.error}
            onRetry={() => void flow.parse()}
            onDismiss={flow.dismissError}
          />
        )}

        <textarea
          className={styles.textarea}
          value={flow.text}
          onChange={(e) => flow.setText(e.target.value)}
          maxLength={DAY_REPORT_LIMITS.textMax}
          placeholder="Например: утром пробежал 5 км за полчаса, днём 2 часа учил английский, вечером посмотрел сериал."
          aria-label="Текст вечернего отчёта"
          data-testid="day-report-text"
        />
        <p className={styles.counter}>
          {length}/{DAY_REPORT_LIMITS.textMax} · черновик сохраняется автоматически
        </p>

        <div className={styles.actions}>
          <Button
            fullWidth
            size="lg"
            onClick={() => void flow.parse()}
            disabled={!flow.canParse}
            data-testid="parse-day-btn"
          >
            ✦ Разобрать день
          </Button>
          <div className={styles.secondaryActions}>
            <Link className={styles.linkButton} to={MANUAL_PATH}>
              Отметить вручную
            </Link>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => onCompleteWithoutParsing(flow.text.trim())}
              disabled={completingWithoutParsing}
            >
              {completingWithoutParsing ? "Завершаем день…" : "Завершить день без разбора"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // preview / applying
  const xp = estimateCharacterXp(flow.events);
  const hours = flow.events.filter((e) => e.enabled).reduce((s, e) => s + (e.hours || 0), 0);
  const applying = flow.phase === "applying";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Проверь события дня</h1>
        <p className={styles.subtitle}>
          Выключи лишнее, поправь часы и навыки. Начисление — после подтверждения.
        </p>
      </header>

      {flow.events.length === 0 ? (
        <p className={styles.empty}>
          В тексте не нашлось занятий, за которые начисляется опыт. Можно дописать текст или
          отметить квесты вручную.
        </p>
      ) : (
        <div className={styles.cards}>
          {flow.events.map((event, i) => (
            <DayEventCard
              key={event.key}
              event={event}
              skills={skills}
              plannedQuestTitle={
                event.plannedQuestId
                  ? (plannedQuestTitles.get(event.plannedQuestId) ?? "квест")
                  : null
              }
              invalidMessage={flow.invalid[i] ?? null}
              onChange={(patch) => flow.updateEvent(event.key, patch)}
            />
          ))}
        </div>
      )}

      <footer className={styles.summary}>
        {/* errors of «Подтвердить» show next to the button the user just pressed */}
        {flow.error && (
          <ErrorBanner
            error={flow.error}
            onRetry={flow.error.code === "NETWORK" ? () => void flow.confirm() : null}
            onDismiss={flow.dismissError}
          />
        )}
        <p className={styles.summaryLine} data-testid="xp-estimate">
          ≈ {xp} XP персонажа · {Math.round(hours * 100) / 100} ч · событий: {flow.enabledCount}
        </p>
        <Button
          fullWidth
          size="lg"
          onClick={() => void flow.confirm()}
          disabled={!flow.canConfirm || flow.enabledCount === 0 || applying}
          data-testid="confirm-day-btn"
        >
          {applying ? "Начисляю…" : "Подтвердить"}
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
    </div>
  );
}
