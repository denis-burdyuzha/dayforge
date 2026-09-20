import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useAppState } from "@/entities/auth/model/useAppState";
import { characterRepository } from "@/entities/character/api/characterRepository";
import { characterQueryKey } from "@/entities/character/model/useCharacter";
import { dailyReportRepository } from "@/entities/daily-report/api/dailyReportRepository";
import type { DayCompletionResult } from "@/entities/daily-report/model/dailyReportTypes";
import { supabase } from "@/shared/api/supabase/client";
import { EmptyState } from "@/shared/ui/EmptyState/ui/EmptyState";
import { LevelUp } from "@/shared/ui/LevelUp/ui/LevelUp";
import { Loading } from "@/shared/ui/Loading/ui/Loading";

import styles from "./DailyReportPage.module.scss";
import { DayCompletionView } from "./DayCompletionView";

export function DailyReportPage() {
  const { session } = useAppState();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const [characterId, setCharacterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Existing report (already completed today) or freshly computed result
  const [existingResult, setExistingResult] = useState<DayCompletionResult | null>(null);
  const [freshResult, setFreshResult] = useState<DayCompletionResult | null>(null);

  // Form state
  const [reportText, setReportText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // LevelUp overlay
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(1);

  // Load character + check if today'"'"'s report already done
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function load() {
      try {
        const char = await characterRepository.getCurrentCharacter(userId!);
        if (!char || cancelled) return;

        setCharacterId(char.id);

        const todayReport = await dailyReportRepository.getTodayReport(char.id);

        if (todayReport && !cancelled) {
          // Day already completed — compute aggregated result for display
          const today = new Date().toISOString().slice(0, 10);
          const todayStart = `${today}T00:00:00.000Z`;
          const todayEnd = `${today}T23:59:59.999Z`;

          // Aggregate XP for today
          const { data: txRows } = await supabase
            .from("xp_transactions")
            .select("amount")
            .eq("character_id", char.id)
            .gte("created_at", todayStart)
            .lte("created_at", todayEnd);

          const totalXpGained = (txRows ?? []).reduce((sum, row) => sum + row.amount, 0);

          // Attribute deltas
          const { data: plan } = await supabase
            .from("daily_plans")
            .select("id")
            .eq("character_id", char.id)
            .eq("date", today)
            .maybeSingle();

          type AttrDelta = { attributeId: string; code: string; name: string; delta: number };
          const deltas: AttrDelta[] = [];

          if (plan) {
            const { data: completedQuests } = await supabase
              .from("quests")
              .select("xp_reward, attribute_id, attribute_definitions(id, code, name)")
              .eq("daily_plan_id", plan.id)
              .eq("status", "completed")
              .not("attribute_id", "is", null);

            const attrMap = new Map<string, AttrDelta>();
            for (const quest of completedQuests ?? []) {
              if (!quest.attribute_id) continue;
              const def = Array.isArray(quest.attribute_definitions)
                ? quest.attribute_definitions[0]
                : quest.attribute_definitions;
              if (!def) continue;

              const existing = attrMap.get(quest.attribute_id);
              if (existing) {
                existing.delta += quest.xp_reward;
              } else {
                attrMap.set(quest.attribute_id, {
                  attributeId: quest.attribute_id,
                  code: def.code,
                  name: def.name,
                  delta: quest.xp_reward,
                });
              }
            }
            deltas.push(...attrMap.values());
          }

          if (!cancelled) {
            setExistingResult({
              report: todayReport,
              totalXpGained,
              attributeDeltas: deltas,
              leveledUp: false,
              newLevel: char.level,
            });
          }
        }

        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Ошибка загрузки");
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleCompleteDay() {
    if (!characterId || submitting) return;

    setSubmitting(true);
    try {
      // Read current level before completing
      const charBefore = await characterRepository.getCurrentCharacter(userId!);
      const levelBefore = charBefore?.level ?? 1;

      const result = await dailyReportRepository.completeDay(characterId, reportText.trim());

      // Read level again after (it was updated per-quest already)
      const charAfter = await characterRepository.getCurrentCharacter(userId!);
      const levelAfter = charAfter?.level ?? 1;

      const didLevelUp = levelAfter > levelBefore;
      const finalResult: DayCompletionResult = {
        ...result,
        leveledUp: didLevelUp,
        newLevel: levelAfter,
      };

      setFreshResult(finalResult);

      // Invalidate queries so Character Page updates
      if (userId) {
        void queryClient.invalidateQueries({
          queryKey: characterQueryKey(userId),
        });
        void queryClient.invalidateQueries({
          queryKey: ["character", characterId, "xp-events"],
        });
        void queryClient.invalidateQueries({
          queryKey: ["character", characterId, "attributes"],
        });
      }

      // Show LevelUp overlay if needed
      if (didLevelUp) {
        setLevelUpLevel(levelAfter);
        setShowLevelUp(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка завершения дня");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.center}>
        <Loading label="Загружаем отчёт…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.center}>
        <EmptyState title="Ошибка" description={error} />
      </div>
    );
  }

  // Day already completed (loaded from DB)
  if (existingResult) {
    return <DayCompletionView result={existingResult} isFresh={false} />;
  }

  // Freshly completed this session
  if (freshResult) {
    return (
      <>
        {showLevelUp && <LevelUp level={levelUpLevel} onComplete={() => setShowLevelUp(false)} />}
        <DayCompletionView result={freshResult} isFresh />
      </>
    );
  }

  // Form
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Как прошёл твой день?</h1>
        <p className={styles.subtitle}>
          Напиши свободным текстом — этот отчёт сохранится для будущего анализа.
        </p>
      </div>

      <div className={styles.textareaWrap}>
        <textarea
          className={styles.textarea}
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          placeholder="Что сделал? Что было сложно? Чем доволен?"
          aria-label="Текст вечернего отчёта"
        />
      </div>

      <div className={styles.completeBtnWrap}>
        <button
          type="button"
          className={styles.completeBtn}
          onClick={handleCompleteDay}
          disabled={submitting}
          id="complete-day-btn"
        >
          {submitting ? "Завершаем день…" : "✦ Завершить день"}
        </button>
      </div>
    </div>
  );
}
