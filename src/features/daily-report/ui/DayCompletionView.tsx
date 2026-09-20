import type { DayCompletionResult } from "@/entities/daily-report/model/dailyReportTypes";
import { Card } from "@/shared/ui/Card/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState/ui/EmptyState";

import styles from "./DailyReportPage.module.scss";

// ---------------------------------------------------------------------------
// Attribute meta (same as HomePage)
// ---------------------------------------------------------------------------

const ATTR_META: Record<string, { label: string; icon: string }> = {
  strength: { label: "Сила", icon: "💪" },
  endurance: { label: "Выносливость", icon: "🏃" },
  discipline: { label: "Дисциплина", icon: "🎯" },
  intelligence: { label: "Интеллект", icon: "🧠" },
  focus: { label: "Фокус", icon: "🔍" },
  social: { label: "Социальность", icon: "🤝" },
  creativity: { label: "Креативность", icon: "🎨" },
};

// ---------------------------------------------------------------------------

interface DayCompletionViewProps {
  result: DayCompletionResult;
  /** Whether this result was just computed (fresh) or loaded from DB (already done earlier) */
  isFresh?: boolean;
}

export function DayCompletionView({ result, isFresh = false }: DayCompletionViewProps) {
  const hasXp = result.totalXpGained > 0;
  const hasDeltas = result.attributeDeltas.length > 0;

  return (
    <div className={styles.completionPage}>
      {/* Hero */}
      <div className={styles.completionHero}>
        <span className={styles.completionLabel}>TODAY&apos;S PROGRESS</span>
        <h1 className={styles.completionTitle}>{isFresh ? "День завершён!" : "Итог дня"}</h1>

        {hasXp ? (
          <div className={styles.xpBadge}>
            <span>⚡</span>
            <span>+{result.totalXpGained} XP</span>
          </div>
        ) : (
          <div
            style={{
              marginTop: "var(--space-2)",
              color: "var(--color-text-secondary)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            XP сегодня не начислялось
          </div>
        )}
      </div>

      {/* Attribute deltas */}
      {hasDeltas ? (
        <section>
          <p className={styles.sectionTitle}>Рост характеристик</p>
          <div className={styles.attrDeltasList}>
            {result.attributeDeltas.map((delta) => {
              const meta = ATTR_META[delta.code];
              return (
                <Card key={delta.attributeId} className={styles.attrDeltaRow}>
                  <span className={styles.attrDeltaName}>
                    {meta?.icon} {meta?.label ?? delta.name}
                  </span>
                  <span className={styles.attrDeltaValue}>+{delta.delta} XP</span>
                </Card>
              );
            })}
          </div>
        </section>
      ) : (
        !hasXp && (
          <Card>
            <EmptyState
              title="Квесты сегодня не были выполнены"
              description="Сегодня квесты не были отмечены выполненными — это нормально, завтра новый день."
            />
          </Card>
        )
      )}

      {/* Report text */}
      {result.report.content && (
        <section className={styles.reportTextSection}>
          <p className={styles.sectionTitle}>Текст отчёта</p>
          <div className={styles.reportTextCard}>
            <p className={styles.reportText}>{result.report.content}</p>
          </div>
        </section>
      )}
    </div>
  );
}
