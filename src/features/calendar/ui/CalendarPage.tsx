import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAppState } from "@/entities/auth/model/useAppState";
import { characterRepository } from "@/entities/character/api/characterRepository";
import { enrichSkillWithStats } from "@/entities/character/model/characterSkillTypes";
import { toSkillView } from "@/entities/character/model/skillPresentation";
import { characterQueryKey, useCharacter } from "@/entities/character/model/useCharacter";
import { dailyPlanRepository } from "@/entities/daily-plan/api/dailyPlanRepository";
import {
  calendarQueryKey,
  DEFAULT_NEW_DURATION,
  questErrorMessage,
  weekDays,
  weekStart,
  weekTitle,
} from "@/entities/daily-plan/model/calendar";
import type { CalendarQuest, QuestUpdateInput } from "@/entities/daily-plan/model/dailyPlanTypes";
import { useUserToday } from "@/entities/profile/model/useProfile";
import {
  type CompletingQuest,
  useDeferredQuestCompletion,
} from "@/features/quest-completion/model/useDeferredQuestCompletion";
import { QuestUndoBar } from "@/features/quest-completion/ui/QuestUndoBar";
import type { QuestCompletionResult } from "@/shared/api/supabase/rpcTypes";
import { dayLabel } from "@/shared/lib/dayLabel";
import { addDays } from "@/shared/lib/userDay";
import { ErrorState } from "@/shared/ui/ErrorState/ui/ErrorState";
import { LevelUp } from "@/shared/ui/LevelUp/ui/LevelUp";
import { Loading } from "@/shared/ui/Loading/ui/Loading";

import styles from "./Calendar.module.scss";
import { CalendarDayView } from "./CalendarDayView";
import { CalendarWeekView } from "./CalendarWeekView";
import { type QuestDraft, QuestEditSheet } from "./QuestEditSheet";

type View = "day" | "week";

/**
 * «Календарь»: the day (default) and week views of the plan, quest editing in a bottom card, dragging blocks,
 * creating by a tap on the scale. Every write is an RPC (create_quest / update_quest / delete_quest /
 * complete_quest); a failed one puts the block back and explains why.
 */
export function CalendarPage() {
  const { session } = useAppState();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { today, now, ready: dayReady } = useUserToday(userId);
  const { data: character } = useCharacter(userId);
  const characterId = character?.id;

  const date = searchParams.get("date") ?? today;
  const view: View = searchParams.get("view") === "week" ? "week" : "day";
  const monday = weekStart(date);
  const days = weekDays(date);

  const questsQuery = useQuery<CalendarQuest[]>({
    queryKey: calendarQueryKey(characterId, monday),
    queryFn: () => dailyPlanRepository.getQuestsInRange(characterId!, monday, days[6]!),
    enabled: Boolean(characterId) && dayReady,
    staleTime: 15_000,
  });
  const attributesQuery = useQuery({
    queryKey: ["character", characterId, "attributes"],
    queryFn: () => characterRepository.getCharacterAttributes(characterId!),
    enabled: Boolean(characterId),
    staleTime: 30_000,
  });
  const skillsQuery = useQuery({
    queryKey: ["character", characterId, "character-skills"],
    queryFn: () => characterRepository.getCharacterSkills(characterId!),
    enabled: Boolean(characterId),
    staleTime: 30_000,
  });
  const skills = (skillsQuery.data ?? []).map((s) =>
    toSkillView(enrichSkillWithStats(s), attributesQuery.data ?? []),
  );

  /** optimistic positions of dragged blocks until the RPC answers */
  const [moved, setMoved] = useState<ReadonlyMap<string, string>>(new Map());
  const [draft, setDraft] = useState<QuestDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string; error: boolean } | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  function showToast(text: string, error = false) {
    const id = Date.now();
    setToast({ id, text, error });
    window.setTimeout(() => setToast((t) => (t?.id === id ? null : t)), error ? 4000 : 2200);
  }

  function go(params: { date?: string; view?: View }) {
    const next = new URLSearchParams(searchParams);
    if (params.date) next.set("date", params.date);
    if (params.view) next.set("view", params.view);
    setSearchParams(next, { replace: true });
  }

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["calendar", characterId] });

  /** complete_quest answered (after the undo window): XP toast, LevelUp, caches */
  function handleCompleted(_quest: CompletingQuest, result: QuestCompletionResult) {
    let text = result.xpAwarded > 0 ? `+${result.xpAwarded} XP` : "Выполнено ✓";
    if (result.attributeGained > 0) text += ` · +${result.attributeGained} к хар.`;
    if (result.skillXpGained > 0) text += ` · +${result.skillXpGained} к навыку`;
    showToast(text);
    if (result.newLevel > result.oldLevel) setLevelUp(result.newLevel);
    void refresh();
    if (userId) void queryClient.invalidateQueries({ queryKey: characterQueryKey(userId) });
    void queryClient.invalidateQueries({ queryKey: ["character", characterId] });
  }

  const completion = useDeferredQuestCompletion({
    characterId,
    onCompleted: handleCompleted,
    onFailed: (_quest, message) => showToast(message, true),
  });

  const allQuests = (questsQuery.data ?? []).map((q) => {
    const shown = moved.has(q.id) ? { ...q, startTime: moved.get(q.id) ?? q.startTime } : q;
    return completion.optimisticIds.has(q.id) ? { ...shown, status: "completed" as const } : shown;
  });
  const dayQuests = allQuests.filter((q) => q.date === date);

  function openQuest(q: CalendarQuest) {
    setSheetError(null);
    setDraft({
      id: q.id,
      status: q.status,
      title: q.title,
      date: q.date,
      startTime: q.startTime,
      durationMinutes: q.durationMinutes ?? (q.hours != null ? Math.round(q.hours * 60) : null),
      skillId: q.skillId,
    });
  }

  function createAt(startTime: string) {
    setSheetError(null);
    setDraft({
      id: null,
      status: "pending",
      title: "",
      date,
      startTime,
      durationMinutes: DEFAULT_NEW_DURATION,
      skillId: null,
    });
  }

  async function moveQuest(q: CalendarQuest, startTime: string) {
    setMoved((m) => new Map(m).set(q.id, startTime));
    try {
      await dailyPlanRepository.updateQuest(q.id, {
        title: q.title,
        date: q.date,
        startTime,
        durationMinutes: q.durationMinutes,
        skillId: q.skillId,
      });
      await refresh();
      showToast(`«${q.title}» — ${startTime}`);
    } catch (err) {
      showToast(questErrorMessage(err), true); // the block goes back to its place
    } finally {
      setMoved((m) => {
        const next = new Map(m);
        next.delete(q.id);
        return next;
      });
    }
  }

  async function save(edited: QuestUpdateInput) {
    if (!draft) return;
    // a completed quest: only the title changes — the other fields go back exactly as stored (a legacy quest has
    // hours but no duration_minutes; sending hours × 60 would count as a change → QUEST_COMPLETED)
    const original = draft.id ? questsQuery.data?.find((q) => q.id === draft.id) : undefined;
    const input: QuestUpdateInput =
      draft.status === "completed" && original
        ? {
            title: edited.title,
            date: original.date,
            startTime: original.startTime,
            durationMinutes: original.durationMinutes,
            skillId: original.skillId,
          }
        : edited;
    setBusy(true);
    setSheetError(null);
    try {
      if (draft.id) await dailyPlanRepository.updateQuest(draft.id, input);
      else await dailyPlanRepository.createQuest(input);
      await refresh();
      setDraft(null);
      if (input.date !== date) go({ date: input.date });
    } catch (err) {
      setSheetError(questErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!draft?.id) return;
    setBusy(true);
    setSheetError(null);
    try {
      await dailyPlanRepository.deleteQuest(draft.id);
      await refresh();
      setDraft(null);
      showToast("Квест удалён");
    } catch (err) {
      setSheetError(questErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  /** «Выполнено» — shows at once, complete_quest is sent after the 5-second undo window */
  function complete() {
    if (!draft?.id) return;
    completion.complete({ id: draft.id, title: draft.title });
    setDraft(null);
  }

  if (!dayReady || (questsQuery.isLoading && !questsQuery.data)) {
    return (
      <div className={styles.center}>
        <Loading label="Загружаем календарь…" />
      </div>
    );
  }
  if (questsQuery.error) {
    return (
      <div className={styles.center}>
        <ErrorState
          title="Ошибка загрузки"
          description="Не удалось получить квесты. Проверь соединение и обнови страницу."
        />
      </div>
    );
  }

  const step = view === "week" ? 7 : 1;

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.viewSwitch} role="tablist" aria-label="Вид календаря">
          {(["day", "week"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              className={view === v ? styles.viewActive : styles.viewBtn}
              onClick={() => go({ view: v })}
              data-testid={`view-${v}`}
            >
              {v === "day" ? "День" : "Неделя"}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.planTextBtn}
          onClick={() => navigate(`/app/plan?date=${date}`)}
          data-testid="plan-text-btn"
        >
          <Sparkles size={16} aria-hidden="true" /> Спланировать текстом
        </button>
      </div>

      <div className={styles.navRow}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => go({ date: addDays(date, -step) })}
          aria-label={view === "week" ? "Предыдущая неделя" : "Предыдущий день"}
          data-testid="nav-prev"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <h1 className={styles.navTitle} data-testid="calendar-title">
          {view === "week" ? weekTitle(date) : dayLabel(date, today)}
        </h1>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => go({ date: addDays(date, step) })}
          aria-label={view === "week" ? "Следующая неделя" : "Следующий день"}
          data-testid="nav-next"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={styles.todayBtn}
          onClick={() => go({ date: today })}
          disabled={date === today}
          data-testid="nav-today"
        >
          <CalendarDays size={16} aria-hidden="true" /> Сегодня
        </button>
      </div>

      {view === "day" ? (
        <>
          {dayQuests.length === 0 && (
            <p className={styles.emptyHint}>
              На этот день квестов нет. Нажми на шкалу, чтобы добавить квест на это время.
            </p>
          )}
          <CalendarDayView
            date={date}
            quests={dayQuests}
            skills={skills}
            now={now}
            onOpen={openQuest}
            onCreateAt={createAt}
            onMove={(q, t) => void moveQuest(q, t)}
            onSwipe={(d) => go({ date: addDays(date, d) })}
          />
        </>
      ) : (
        <CalendarWeekView
          days={days}
          quests={allQuests}
          skills={skills}
          today={today}
          now={now}
          onOpenDay={(d) => go({ date: d, view: "day" })}
        />
      )}

      <QuestEditSheet
        draft={draft}
        skills={skills}
        busy={busy}
        error={sheetError}
        onClose={() => !busy && setDraft(null)}
        onSave={(input) => void save(input)}
        onDelete={() => void remove()}
        onComplete={complete}
      />

      <QuestUndoBar pending={completion.pending} onUndoLast={completion.undoLast} />

      {levelUp !== null && <LevelUp level={levelUp} onComplete={() => setLevelUp(null)} />}

      {toast && (
        <div
          className={toast.error ? styles.toastError : styles.toast}
          role={toast.error ? "alert" : "status"}
          data-testid="calendar-toast"
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
