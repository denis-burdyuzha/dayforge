import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useAppState } from "@/entities/auth/model/useAppState";
import { characterRepository } from "@/entities/character/api/characterRepository";
import { enrichSkillWithStats } from "@/entities/character/model/characterSkillTypes";
import { type SkillView, toSkillView } from "@/entities/character/model/skillPresentation";
import { characterQueryKey } from "@/entities/character/model/useCharacter";
import { dailyPlanRepository } from "@/entities/daily-plan/api/dailyPlanRepository";
import { dailyReportRepository } from "@/entities/daily-report/api/dailyReportRepository";
import type { ApplyDayReportResult } from "@/entities/daily-report/model/aiDayReport";
import type { DayCompletionResult } from "@/entities/daily-report/model/dailyReportTypes";
import { useUserToday } from "@/entities/profile/model/useProfile";
import { supabase } from "@/shared/api/supabase/client";
import { getUserDayRangeIso } from "@/shared/lib/userDay";
import { EmptyState } from "@/shared/ui/EmptyState/ui/EmptyState";
import { LevelUp } from "@/shared/ui/LevelUp/ui/LevelUp";
import { Loading } from "@/shared/ui/Loading/ui/Loading";

import { AiDayReport } from "./AiDayReport";
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

  // Data for the AI preview: the user's skills and today's pending quests (id → title)
  const [skills, setSkills] = useState<SkillView[]>([]);
  const [plannedQuestTitles, setPlannedQuestTitles] = useState<ReadonlyMap<string, string>>(
    new Map(),
  );
  const [submitting, setSubmitting] = useState(false);
  // the user's day (by the profile's day boundary): the night before it still reports the previous day
  const { today: reportDate, dayStartTime, ready: dayReady } = useUserToday(userId);

  // LevelUp overlay
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(1);

  // Load character + check if today'"'"'s report already done
  useEffect(() => {
    if (!userId || !dayReady) return;
    let cancelled = false;

    async function load() {
      try {
        const char = await characterRepository.getCurrentCharacter(userId!);
        if (!char || cancelled) return;

        setCharacterId(char.id);

        const [charSkills, attributes, todayPlan] = await Promise.all([
          characterRepository.getCharacterSkills(char.id),
          characterRepository.getCharacterAttributes(char.id),
          dailyPlanRepository.getPlan(char.id, reportDate),
        ]);
        if (cancelled) return;
        setSkills(charSkills.map((s) => toSkillView(enrichSkillWithStats(s), attributes)));
        setPlannedQuestTitles(
          new Map(
            (todayPlan?.quests ?? [])
              .filter((q) => q.status === "pending")
              .map((q) => [q.id, q.title]),
          ),
        );

        const todayReport = await dailyReportRepository.getReport(char.id, reportDate);

        if (todayReport && !cancelled) {
          // Day already completed — compute aggregated result for display
          const today = reportDate;
          const { start: todayStart, end: todayEnd } = getUserDayRangeIso(today, dayStartTime);

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
  }, [userId, dayReady, reportDate, dayStartTime]);

  /** Saves the report text and shows the day result (the existing flow after quests were credited) */
  async function finishDay(text: string, levelBefore: number, levelAfter?: number) {
    if (!characterId) return;
    const result = await dailyReportRepository.completeDay(
      characterId,
      reportDate,
      dayStartTime,
      text,
    );
    const charAfter = await characterRepository.getCurrentCharacter(userId!);
    const newLevel = levelAfter ?? charAfter?.level ?? levelBefore;
    const didLevelUp = newLevel > levelBefore;
    setFreshResult({ ...result, leveledUp: didLevelUp, newLevel });

    // Invalidate queries so the Character Page updates (XP, attributes, skills)
    if (userId) {
      void queryClient.invalidateQueries({ queryKey: characterQueryKey(userId) });
      void queryClient.invalidateQueries({ queryKey: ["character", characterId, "xp-events"] });
      void queryClient.invalidateQueries({ queryKey: ["character", characterId, "attributes"] });
      void queryClient.invalidateQueries({
        queryKey: ["character", characterId, "character-skills"],
      });
    }
    if (didLevelUp) {
      setLevelUpLevel(newLevel);
      setShowLevelUp(true);
    }
  }

  /** AI flow: apply_day_report already credited XP — save the text and show the result */
  async function handleApplied(result: ApplyDayReportResult, text: string) {
    await finishDay(text, result.oldLevel, result.newLevel);
  }

  /** Old flow: complete the day without parsing (quests were marked on the plan page) */
  async function handleCompleteWithoutParsing(text: string) {
    if (!characterId || submitting) return;
    setSubmitting(true);
    try {
      const charBefore = await characterRepository.getCurrentCharacter(userId!);
      await finishDay(text, charBefore?.level ?? 1);
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

  // AI day report (text → parse → preview → apply)
  return (
    <AiDayReport
      reportDate={reportDate}
      skills={skills}
      plannedQuestTitles={plannedQuestTitles}
      onApplied={handleApplied}
      onCompleteWithoutParsing={(text) => void handleCompleteWithoutParsing(text)}
      completingWithoutParsing={submitting}
    />
  );
}
