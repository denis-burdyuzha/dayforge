import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";

import { useAppState } from "@/entities/auth/model/useAppState";
import { characterRepository } from "@/entities/character/api/characterRepository";
import type { CharacterAttribute } from "@/entities/character/model/characterTypes";
import { characterQueryKey } from "@/entities/character/model/useCharacter";
import { dailyPlanRepository } from "@/entities/daily-plan/api/dailyPlanRepository";
import type { DailyPlan, NewQuestInput, Quest } from "@/entities/daily-plan/model/dailyPlanTypes";
import { Card } from "@/shared/ui/Card/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState/ui/EmptyState";
import { LevelUp } from "@/shared/ui/LevelUp/ui/LevelUp";
import { Loading } from "@/shared/ui/Loading/ui/Loading";

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
  return new Date(isoDate).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ---------------------------------------------------------------------------
// AddQuestForm
// ---------------------------------------------------------------------------

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
        hours: hasSkill ? Math.max(0.25, hours) : null,
      });
      setTitle("");
      setSkillName("");
      setHours(1);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveTags() {
    setSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        skillName: skillName.trim(),
        hours: Math.max(0.25, hours),
        primaryAttributeId: selectedAttrIds[0] ?? null,
        secondaryAttributeId: selectedAttrIds[1] ?? null,
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

  async function handleSkipTags() {
    setSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        skillName: skillName.trim(),
        hours: Math.max(0.25, hours),
        primaryAttributeId: null,
        secondaryAttributeId: null,
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
            Навык «{skillName.trim()}» — выбери 1-2 характеристики (максимум 2)
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
            disabled={submitting}
          >
            {submitting ? "Сохраняем…" : "Сохранить"}
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleSkipTags}
            disabled={submitting}
          >
            Пропустить
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
              min={0.25}
              max={24}
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
        {quest.skillName && (
          <div className={styles.questMeta}>
            <span className={styles.questSkill}>
              🎯 {quest.skillName}
              {quest.hours != null ? ` · ${quest.hours}ч` : ""}
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

  const { toasts, push: pushToast } = useMicroToasts();

  // Load today's plan, skills, and attributes
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    getCharacterIdFromUserId(userId)
      .then(async (characterId) => {
        if (!characterId || cancelled) return;

        const [todayPlan, existingSkills, charAttributes] = await Promise.all([
          dailyPlanRepository.getTodayPlan(characterId).then(async (plan) => {
            if (!plan) return dailyPlanRepository.createTodayPlan(characterId);
            return plan;
          }),
          characterRepository.getCharacterSkills(characterId),
          characterRepository.getCharacterAttributes(characterId),
        ]);

        if (cancelled) return;

        setExistingSkillNames(existingSkills.map((s) => s.name));
        setAttributes(charAttributes);
        setPlan(todayPlan);
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
  }, [userId]);

  async function handleCompleteQuest(quest: Quest) {
    if (!plan || completing) return;

    const characterId = plan.characterId;
    setCompleting(quest.id);

    try {
      const result = await dailyPlanRepository.completeQuest(quest.id, characterId);

      let toastMsg = `+${result.xpAwarded} XP`;
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

    const newQuest = await dailyPlanRepository.addQuest(plan.id, input);

    setPlan((prev) => {
      if (!prev) return prev;
      return { ...prev, quests: [...prev.quests, newQuest] };
    });

    setShowAddForm(false);
  }

  if (loading) {
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

  const today = new Date().toISOString().slice(0, 10);
  const pendingCount = plan?.quests.filter((q) => q.status === "pending").length ?? 0;
  const completedCount = plan?.quests.filter((q) => q.status === "completed").length ?? 0;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Дневной план</h1>
          <p className={styles.dateLabel}>{formatDate(today)}</p>
        </div>
        {plan && plan.quests.length > 0 && (
          <div className={styles.dateLabel}>
            {completedCount} / {plan.quests.length}
          </div>
        )}
      </div>

      {/* Quest list */}
      {plan && plan.quests.length > 0 ? (
        <>
          <p className={styles.sectionTitle}>{pendingCount > 0 ? "Квесты" : "Все выполнено!"}</p>
          <div className={styles.questList}>
            {plan.quests.map((quest) => (
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
            description="Добавь первый квест на сегодня — и начни прокачку."
          />
        </div>
      )}

      {/* Add quest */}
      <div className={styles.addSection}>
        {showAddForm ? (
          <AddQuestForm
            onAdd={handleAddQuest}
            onCancel={() => setShowAddForm(false)}
            existingSkillNames={existingSkillNames}
            attributes={attributes}
          />
        ) : (
          <button
            type="button"
            className={styles.addToggleBtn}
            onClick={() => setShowAddForm(true)}
          >
            <span>＋</span>
            <span>Добавить квест</span>
          </button>
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
