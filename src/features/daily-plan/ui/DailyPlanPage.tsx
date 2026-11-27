import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useAppState } from "@/entities/auth/model/useAppState";
import { characterRepository } from "@/entities/character/api/characterRepository";
import { enrichSkillWithStats } from "@/entities/character/model/characterSkillTypes";
import type { CharacterAttribute } from "@/entities/character/model/characterTypes";
import { type SkillView, toSkillView } from "@/entities/character/model/skillPresentation";
import { characterQueryKey } from "@/entities/character/model/useCharacter";
import { dailyPlanRepository } from "@/entities/daily-plan/api/dailyPlanRepository";
import {
  type ApplyDayPlanResult,
  formatDuration,
  sortByTime,
  type TimedEntry,
} from "@/entities/daily-plan/model/aiDayPlan";
import type { DailyPlan, NewQuestInput, Quest } from "@/entities/daily-plan/model/dailyPlanTypes";
import { useUserToday } from "@/entities/profile/model/useProfile";
import { dayLabel } from "@/shared/lib/dayLabel";
import { parseLocalDate } from "@/shared/lib/localDate";
import { addDays, defaultPlanTarget, type PlanTarget } from "@/shared/lib/userDay";
import { Card } from "@/shared/ui/Card/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState/ui/EmptyState";
import { LevelUp } from "@/shared/ui/LevelUp/ui/LevelUp";
import { Loading } from "@/shared/ui/Loading/ui/Loading";

import { AiDayPlan } from "./AiDayPlan";
import styles from "./DailyPlanPage.module.scss";

// ---------------------------------------------------------------------------
// Micro-toast
// ---------------------------------------------------------------------------

interface MicroToast {
  id: number;
  message: string;
}

let toastIdCounter = 0;

function useMicroToasts() {
  const [toasts, setToasts] = useState<MicroToast[]>([]);

  function push(message: string) {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2100);
  }

  return { toasts, push };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(isoDate: string): string {
  return parseLocalDate(isoDate).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ---------------------------------------------------------------------------
// AddQuestForm
// ---------------------------------------------------------------------------

/** quest duration limits of the database (create_quest: 5–480 minutes) */
const MIN_QUEST_HOURS = 0.25;
const MAX_QUEST_HOURS = 8;
const clampHours = (h: number) => Math.min(MAX_QUEST_HOURS, Math.max(MIN_QUEST_HOURS, h));

interface AddQuestFormProps {
  onAdd: (input: NewQuestInput) => Promise<void>;
  onCancel: () => void;
  existingSkillNames: string[];
  attributes: CharacterAttribute[];
}

function AddQuestForm({ onAdd, onCancel, existingSkillNames, attributes }: AddQuestFormProps) {
  const titleId = useId();
  const skillId = useId();
  const hoursId = useId();
  const skillListId = useId();

  const [step, setStep] = useState<"quest" | "tags">("quest");
  const [title, setTitle] = useState("");
  const [skillName, setSkillName] = useState("");
  const [hours, setHours] = useState<number>(1);
  const [selectedAttrIds, setSelectedAttrIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "quest") {
      titleRef.current?.focus();
    }
  }, [step]);

  const hasSkill = skillName.trim().length > 0;
  const isNewSkill =
    hasSkill &&
    !existingSkillNames.map((s) => s.toLowerCase()).includes(skillName.trim().toLowerCase());

  async function handleQuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    if (isNewSkill) {
      setStep("tags");
      return;
    }

    setSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        skillName: hasSkill ? skillName.trim() : null,
        hours: hasSkill ? clampHours(hours) : null,
      });
      setTitle("");
      setSkillName("");
      setHours(1);
    } finally {
      setSubmitting(false);
    }
  }

  /** a new skill needs its primary attribute (the first selected); the second one is optional */
  async function handleSaveTags() {
    const codes = selectedAttrIds
      .map((id) => attributes.find((a) => a.attributeId === id)?.code)
      .filter((code): code is string => code !== undefined);
    if (codes.length === 0) return;
    setSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        skillName: skillName.trim(),
        hours: clampHours(hours),
        attributeCodes: codes,
      });
      setTitle("");
      setSkillName("");
      setHours(1);
      setSelectedAttrIds([]);
      setStep("quest");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "tags") {
    return (
      <div className={styles.tagStep}>
        <div>
          <h3 className={styles.tagStepTitle}>Что развивает этот навык?</h3>
          <p className={styles.tagStepSubtitle}>
            Навык «{skillName.trim()}» — выбери основную характеристику (обязательно) и, если нужно,
            вторую
          </p>
        </div>

        <div className={styles.tagGrid}>
          {attributes.map((attr) => {
            const isSelected = selectedAttrIds.includes(attr.attributeId);
            const isDisabled = !isSelected && selectedAttrIds.length >= 2;

            return (
              <button
                key={attr.attributeId}
                type="button"
                className={[
                  styles.tagChip,
                  isSelected ? styles.tagChipSelected : "",
                  isDisabled ? styles.tagChipDisabled : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  if (isSelected) {
                    setSelectedAttrIds((prev) => prev.filter((id) => id !== attr.attributeId));
                  } else if (selectedAttrIds.length < 2) {
                    setSelectedAttrIds((prev) => [...prev, attr.attributeId]);
                  }
                }}
              >
                <span>{attr.name}</span>
                {isSelected && <span>✓</span>}
              </button>
            );
          })}
        </div>

        <div className={styles.tagActions}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleSaveTags}
            disabled={submitting || selectedAttrIds.length === 0}
          >
            {submitting ? "Сохраняем…" : "Сохранить"}
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => setStep("quest")}
            disabled={submitting}
          >
            ← Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.addForm} onSubmit={handleQuestSubmit}>
      {/* Quest title */}
      <div className={styles.formGroup}>
        <label htmlFor={titleId} className={styles.formLabel}>
          Название квеста *
        </label>
        <input
          ref={titleRef}
          id={titleId}
          className={styles.formInput}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Что нужно сделать?"
          required
        />
      </div>

      {/* Skill section */}
      <div className={styles.skillSection}>
        <p className={styles.skillSectionLabel}>Навык (необязательно)</p>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor={skillId} className={styles.formLabel}>
              Название навыка
            </label>
            <datalist id={skillListId}>
              {existingSkillNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <input
              id={skillId}
              className={styles.formInput}
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="SEO, Rust, Программирование…"
              list={skillListId}
              autoComplete="off"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor={hoursId} className={styles.formLabel}>
              Часов
            </label>
            <input
              id={hoursId}
              className={styles.formInput}
              type="number"
              min={MIN_QUEST_HOURS}
              max={MAX_QUEST_HOURS}
              step={0.25}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              disabled={!hasSkill}
            />
          </div>
        </div>
        {hasSkill && (
          <p className={styles.skillHint}>
            {!isNewSkill
              ? `📊 Засчитается к существующему навыку «${skillName.trim()}»`
              : `✨ Новый навык «${skillName.trim()}» — при клике выберем развиваемые характеристики`}
          </p>
        )}
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary} disabled={submitting || !title.trim()}>
          {isNewSkill ? "Далее →" : submitting ? "Добавляем…" : "Добавить квест"}
        </button>
        <button type="button" className={styles.btnSecondary} onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// QuestItem
// ---------------------------------------------------------------------------

function QuestItem({
  quest,
  onComplete,
  completing,
}: {
  quest: Quest;
  onComplete: (q: Quest) => void;
  completing: boolean;
}) {
  const isCompleted = quest.status === "completed";

  return (
    <Card
      variant="interactive"
      className={[styles.questCard, isCompleted ? styles.questCompleted : ""]
        .filter(Boolean)
        .join(" ")}
      onClick={() => {
        if (!isCompleted && !completing) onComplete(quest);
      }}
      role="button"
      tabIndex={0}
      aria-label={
        isCompleted
          ? `Квест выполнен: ${quest.title}`
          : `Отметить квест выполненным: ${quest.title}`
      }
      onKeyDown={(e) => {
        if (!isCompleted && !completing && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onComplete(quest);
        }
      }}
    >
      <div
        className={[styles.checkbox, isCompleted ? styles.checkboxChecked : ""]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
      >
        {isCompleted && <span className={styles.checkmark}>✓</span>}
      </div>

      <div className={styles.questBody}>
        <div className={styles.questTitle}>{quest.title}</div>
        {(quest.startTime || quest.skillName || quest.durationMinutes != null) && (
          <div className={styles.questMeta}>
            <span className={styles.questSkill}>
              {[
                quest.startTime,
                quest.skillName ? `🎯 ${quest.skillName}` : "без навыка",
                quest.durationMinutes != null
                  ? formatDuration(quest.durationMinutes)
                  : quest.hours != null
                    ? `${quest.hours}ч`
                    : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function DailyPlanPage() {
  const { session } = useAppState();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(1);
  const [existingSkillNames, setExistingSkillNames] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<CharacterAttribute[]>([]);
  const [skills, setSkills] = useState<SkillView[]>([]);
  const addSectionRef = useRef<HTMLDivElement>(null);

  const { toasts, push: pushToast } = useMicroToasts();
  // the user's day by the profile's day boundary
  const { today, tomorrow, dayStartTime, ready: dayReady } = useUserToday(userId);
  const [nextDayQuests, setNextDayQuests] = useState<Quest[]>([]);

  // which day the page plans: «Сегодня» / «Завтра» (default by the clock when the page opened), or
  // ?date=YYYY-MM-DD from the calendar
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date");
  const [openedAt] = useState(() => new Date());
  const [chosenTarget, setTarget] = useState<PlanTarget | null>(null);
  const target: PlanTarget | null =
    chosenTarget ??
    (!dayReady
      ? null
      : dateParam === today
        ? "today"
        : dateParam === tomorrow
          ? "tomorrow"
          : defaultPlanTarget(openedAt, dayStartTime));
  /** a date from the calendar that is neither today nor tomorrow is planned as is (no switch) */
  const customDate =
    dateParam &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateParam) &&
    dateParam !== today &&
    dateParam !== tomorrow
      ? dateParam
      : null;
  const planDate = customDate ?? (target === "tomorrow" ? tomorrow : today);
  const nextDate = addDays(planDate, 1);
  const textInputId = "ai-day-plan-text";

  // Load the plan of the selected date (+ the next day's quests for overlaps), skills, and attributes
  useEffect(() => {
    if (!userId || !dayReady || target === null) return;

    let cancelled = false;

    getCharacterIdFromUserId(userId)
      .then(async (characterId) => {
        if (!characterId || cancelled) return;

        const [datePlan, nextPlan, existingSkills, charAttributes] = await Promise.all([
          dailyPlanRepository.getPlan(characterId, planDate).then(async (plan) => {
            if (!plan) return dailyPlanRepository.getOrCreatePlan(planDate);
            return plan;
          }),
          dailyPlanRepository.getPlan(characterId, nextDate),
          characterRepository.getCharacterSkills(characterId),
          characterRepository.getCharacterAttributes(characterId),
        ]);

        if (cancelled) return;

        setExistingSkillNames(existingSkills.map((s) => s.name));
        setSkills(existingSkills.map((s) => toSkillView(enrichSkillWithStats(s), charAttributes)));
        setAttributes(charAttributes);
        setPlan(datePlan);
        setNextDayQuests(nextPlan?.quests ?? []);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Ошибка загрузки");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId, dayReady, target, planDate, nextDate]);

  async function handleCompleteQuest(quest: Quest) {
    if (!plan || completing) return;

    const characterId = plan.characterId;
    setCompleting(quest.id);

    try {
      const result = await dailyPlanRepository.completeQuest(quest.id, characterId);

      // a quest without a skill is completed for 0 XP
      let toastMsg = result.xpAwarded > 0 ? `+${result.xpAwarded} XP` : "Выполнено ✓";
      if (result.attributeGained > 0) toastMsg += ` · +${result.attributeGained} к хар.`;
      if (result.skillXpGained > 0) toastMsg += ` · +${result.skillXpGained} к навыку`;
      pushToast(toastMsg);

      if (result.newLevel > result.oldLevel) {
        setLevelUpLevel(result.newLevel);
        setShowLevelUp(true);
      }

      setPlan((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          quests: prev.quests.map((q): Quest =>
            q.id === quest.id ? { ...q, status: "completed" as const } : q,
          ),
        };
      });

      if (userId) {
        void queryClient.invalidateQueries({ queryKey: characterQueryKey(userId) });
        void queryClient.invalidateQueries({ queryKey: ["character", characterId, "xp-events"] });
        void queryClient.invalidateQueries({ queryKey: ["character", characterId, "attributes"] });
        void queryClient.invalidateQueries({
          queryKey: ["character", characterId, "character-skills"],
        });
      }

      if (quest.skillName) {
        const lower = quest.skillName.toLowerCase();
        setExistingSkillNames((prev) =>
          prev.map((s) => s.toLowerCase()).includes(lower) ? prev : [...prev, quest.skillName!],
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setCompleting(null);
    }
  }

  async function handleAddQuest(input: NewQuestInput) {
    if (!plan) return;

    const newQuest = await dailyPlanRepository.addQuest(plan.date, input);

    setPlan((prev) => {
      if (!prev) return prev;
      return { ...prev, quests: [...prev.quests, newQuest] };
    });

    setShowAddForm(false);
  }

  /** quests created by the AI plan: reload the plan and the skills (new ones may have been created) */
  async function handleAiPlanApplied(result: ApplyDayPlanResult) {
    if (!plan) return;
    const characterId = plan.characterId;
    const [fresh, freshNext, charSkills] = await Promise.all([
      dailyPlanRepository.getPlan(characterId, plan.date),
      dailyPlanRepository.getPlan(characterId, addDays(plan.date, 1)),
      characterRepository.getCharacterSkills(characterId),
    ]);
    if (fresh) setPlan(fresh);
    setNextDayQuests(freshNext?.quests ?? []);
    setSkills(charSkills.map((s) => toSkillView(enrichSkillWithStats(s), attributes)));
    setExistingSkillNames(charSkills.map((s) => s.name));
    pushToast(`В план добавлено: ${result.quests.length}`);
    void queryClient.invalidateQueries({
      queryKey: ["character", characterId, "character-skills"],
    });
  }

  function openManualForm() {
    setShowAddForm(true);
    requestAnimationFrame(() =>
      addSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  /** «Добавить к плану текстом»: back to the plan text field (a new parse appends to the date) */
  function focusTextInput() {
    const input = document.getElementById(textInputId);
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    input?.focus({ preventScroll: true });
  }

  // first load, or the other day was picked and its plan is still loading
  if (loading || (plan !== null && plan.date !== planDate && !error)) {
    return (
      <div className={styles.center}>
        <Loading label="Загружаем план дня…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.center}>
        <EmptyState title="Ошибка загрузки" description={error} />
      </div>
    );
  }

  const pendingCount = plan?.quests.filter((q) => q.status === "pending").length ?? 0;
  const completedCount = plan?.quests.filter((q) => q.status === "completed").length ?? 0;
  const quests = plan?.quests ?? [];
  const timedQuests = quests.filter((q) => q.startTime);
  // quests of the plan date and the next day — overlaps of the preview are checked per date
  const toTimed = (q: Quest, date: string): TimedEntry => ({
    key: `quest:${q.id}`,
    title: q.title,
    date,
    startTime: q.startTime,
    durationMinutes: q.durationMinutes ?? (q.hours != null ? Math.round(q.hours * 60) : 30),
  });
  const existingTimed: TimedEntry[] = [
    ...timedQuests.map((q) => toTimed(q, planDate)),
    ...nextDayQuests.filter((q) => q.startTime).map((q) => toTimed(q, nextDate)),
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Дневной план</h1>
          <p className={styles.dateLabel}>{formatDate(planDate)}</p>
        </div>
        {plan && plan.quests.length > 0 && (
          <div className={styles.dateLabel}>
            {completedCount} / {plan.quests.length}
          </div>
        )}
      </div>

      {/* Which day to plan: «Сегодня / Завтра» (a date opened from the calendar is planned as is) */}
      {!customDate && (
        <div className={styles.dayToggle} role="radiogroup" aria-label="День плана">
          {(["today", "tomorrow"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={target === t}
              className={target === t ? styles.dayToggleActive : styles.dayToggleBtn}
              onClick={() => setTarget(t)}
              data-testid={`plan-target-${t}`}
            >
              {dayLabel(t === "today" ? today : tomorrow, today)}
            </button>
          ))}
        </div>
      )}

      {/* AI plan: text → preview → quests with time (each parse appends to the date) */}
      {plan && (
        <AiDayPlan
          key={plan.date}
          planDate={plan.date}
          today={today}
          dayStartTime={dayStartTime}
          skills={skills}
          existingQuests={existingTimed}
          onApplied={handleAiPlanApplied}
          onManual={openManualForm}
        />
      )}

      {/* Quests of the day in time order (the timeline lives in the «Календарь» tab) */}
      {quests.length > 0 ? (
        <>
          <p className={styles.sectionTitle}>
            {pendingCount > 0 ? "Квесты дня" : "Все выполнено!"}
          </p>
          <div className={styles.questList} data-testid="plan-quest-list">
            {sortByTime(quests).map((quest) => (
              <QuestItem
                key={quest.id}
                quest={quest}
                onComplete={handleCompleteQuest}
                completing={completing === quest.id}
              />
            ))}
          </div>
        </>
      ) : (
        <div className={styles.emptyQuestsWrap}>
          <EmptyState
            title="Квестов нет"
            description="Опиши план текстом или добавь первый квест вручную."
          />
        </div>
      )}

      {/* Append to the plan: by text (a new parse adds to the date) or manually */}
      <div className={styles.addSection} ref={addSectionRef}>
        {showAddForm ? (
          <AddQuestForm
            onAdd={handleAddQuest}
            onCancel={() => setShowAddForm(false)}
            existingSkillNames={existingSkillNames}
            attributes={attributes}
          />
        ) : (
          <div className={styles.appendActions}>
            <button
              type="button"
              className={styles.addToggleBtn}
              onClick={focusTextInput}
              data-testid="append-text-btn"
            >
              <span>✦</span>
              <span>Добавить к плану текстом</span>
            </button>
            <button
              type="button"
              className={styles.addToggleBtn}
              onClick={() => setShowAddForm(true)}
              data-testid="append-manual-btn"
            >
              <span>＋</span>
              <span>Добавить вручную</span>
            </button>
          </div>
        )}
      </div>

      {/* LevelUp modal */}
      {showLevelUp && <LevelUp level={levelUpLevel} onComplete={() => setShowLevelUp(false)} />}

      {/* Micro-toast layer */}
      <div className={styles.toastContainer} aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={styles.microToast}>
            ⚡ {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function getCharacterIdFromUserId(userId: string): Promise<string | null> {
  const char = await characterRepository.getCurrentCharacter(userId);
  return char?.id ?? null;
}
