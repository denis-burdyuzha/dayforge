import { useState } from "react";

import { ATTRIBUTE_LABELS_RU, ATTRIBUTE_ORDER } from "@/entities/character/model/aspect";
import type { SkillView } from "@/entities/character/model/skillPresentation";
import type { AttributeKey } from "@/entities/character/model/types";
import { AttributeRune } from "@/entities/character/ui/AttributeRuneRing";
import { SkillIcon } from "@/entities/character/ui/SkillBadge";
import { DAY_PLAN_LIMITS, type EditablePlanItem } from "@/entities/daily-plan/model/aiDayPlan";
import {
  FALLBACK_SKILL_ICON_KEY,
  getSkillIconByKey,
  SKILL_ICON_OPTIONS,
} from "@/shared/config/skillIcons";

import styles from "./AiDayPlan.module.scss";

interface PlanItemCardProps {
  item: EditablePlanItem;
  skills: SkillView[];
  /** titles of the items / quests this one overlaps in time */
  overlapsWith: string[] | undefined;
  invalidMessage: string | null;
  onChange: (patch: Partial<EditablePlanItem>) => void;
  /** a time edit was committed — the list can be re-sorted */
  onTimeCommitted: () => void;
}

const NEW = "__new__";
const NONE = "__none__";

/** One parsed plan item in the preview: on/off, title, start time, duration, skill, warnings */
export function PlanItemCard({
  item,
  skills,
  overlapsWith,
  invalidMessage,
  onChange,
  onTimeCommitted,
}: PlanItemCardProps) {
  const [iconsOpen, setIconsOpen] = useState(false);
  const skill = item.skill;
  const existing =
    skill.kind === "existing" ? skills.find((s) => s.id === skill.skillId) : undefined;
  const selectValue = skill.kind === "existing" ? skill.skillId : skill.kind === "new" ? NEW : NONE;
  const off = !item.enabled;

  function selectSkill(value: string) {
    if (value === NONE) onChange({ skill: { kind: "none" } });
    else if (value === NEW)
      onChange({
        skill: { kind: "new", name: "", attributes: [], icon: FALLBACK_SKILL_ICON_KEY },
      });
    else onChange({ skill: { kind: "existing", skillId: value } });
  }

  function toggleAttribute(code: AttributeKey) {
    if (skill.kind !== "new") return;
    const has = skill.attributes.includes(code);
    const next = has
      ? skill.attributes.filter((a) => a !== code)
      : [...skill.attributes, code].slice(-2);
    onChange({ skill: { ...skill, attributes: next } });
  }

  const iconOption = skill.kind === "new" ? getSkillIconByKey(skill.icon) : undefined;

  return (
    <article
      className={[styles.card, off ? styles.cardOff : ""].filter(Boolean).join(" ")}
      data-testid="plan-item-card"
      data-skill-kind={skill.kind}
    >
      <div className={styles.cardHeader}>
        <input
          type="checkbox"
          checked={item.enabled}
          onChange={(e) => onChange({ enabled: e.target.checked })}
          aria-label="Добавить пункт в план"
        />
        <input
          className={styles.titleInput}
          value={item.title}
          maxLength={DAY_PLAN_LIMITS.titleMax}
          onChange={(e) => onChange({ title: e.target.value })}
          disabled={off}
          aria-label="Название пункта"
        />
      </div>

      {(item.duplicateOfExisting || item.confidence === "low") && (
        <div className={styles.badges}>
          {item.duplicateOfExisting && <span className={styles.dupBadge}>Уже в плане</span>}
          {item.confidence === "low" && <span className={styles.lowBadge}>Проверь</span>}
        </div>
      )}
      {item.confidence === "low" && item.note && <p className={styles.note}>{item.note}</p>}

      <div className={styles.cardRow}>
        <label className={styles.field}>
          <span>Начало</span>
          <input
            type="time"
            step={300}
            value={item.startTime ?? ""}
            onChange={(e) => onChange({ startTime: e.target.value || null })}
            onBlur={onTimeCommitted}
            disabled={off}
            aria-label="Время начала"
          />
        </label>
        <label className={styles.field}>
          <span>Длительность</span>
          <input
            type="number"
            inputMode="numeric"
            min={DAY_PLAN_LIMITS.durationMin}
            max={DAY_PLAN_LIMITS.durationMax}
            step={DAY_PLAN_LIMITS.durationStep}
            value={Number.isFinite(item.durationMinutes) ? item.durationMinutes : ""}
            onChange={(e) => onChange({ durationMinutes: e.target.valueAsNumber })}
            disabled={off}
            aria-label="Длительность, минут"
          />
          <span>мин</span>
        </label>
      </div>

      <div className={styles.skillRow}>
        {skill.kind === "existing" && existing && (
          <SkillIcon
            name={existing.name}
            primaryAttribute={existing.primaryAttribute}
            iconKey={existing.iconKey}
            form={existing.form}
            size={28}
            iconSize={18}
          />
        )}
        {skill.kind === "new" && <span className={styles.newBadge}>Новый навык</span>}
        {skill.kind === "none" && <span className={styles.noneBadge}>Без навыка</span>}
        <select
          className={styles.skillSelect}
          value={selectValue}
          onChange={(e) => selectSkill(e.target.value)}
          disabled={off}
          aria-label="Навык"
        >
          {skills.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
          <option value={NEW}>+ Новый навык</option>
          <option value={NONE}>Без навыка (0 XP)</option>
        </select>
      </div>

      {skill.kind === "new" && !off && (
        <div className={styles.newSkill}>
          <input
            className={styles.newSkillName}
            value={skill.name}
            maxLength={60}
            placeholder="Название навыка"
            onChange={(e) => onChange({ skill: { ...skill, name: e.target.value } })}
            aria-label="Название нового навыка"
          />
          <div className={styles.attrPicker} role="group" aria-label="Характеристики навыка (1–2)">
            {ATTRIBUTE_ORDER.map((code) => {
              const on = skill.attributes.includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  className={[styles.attrButton, on ? styles.attrOn : ""].filter(Boolean).join(" ")}
                  aria-pressed={on}
                  title={ATTRIBUTE_LABELS_RU[code]}
                  onClick={() => toggleAttribute(code)}
                >
                  <AttributeRune attribute={code} value={on ? 12 : 1} size={24} />
                </button>
              );
            })}
          </div>
          <div className={styles.iconRow}>
            <span>Иконка:</span>
            {iconOption && <iconOption.Icon size={18} aria-hidden="true" />}
            <span className={styles.iconLabel}>{iconOption?.label ?? "Прочее"}</span>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => setIconsOpen((v) => !v)}
            >
              {iconsOpen ? "Готово" : "Сменить"}
            </button>
          </div>
          {iconsOpen && (
            <div className={styles.iconGrid} role="group" aria-label="Иконка навыка">
              {SKILL_ICON_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  className={[styles.iconButton, o.key === skill.icon ? styles.iconOn : ""]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={o.key === skill.icon}
                  title={o.label}
                  onClick={() => onChange({ skill: { ...skill, icon: o.key } })}
                >
                  <o.Icon size={18} aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!off && overlapsWith && overlapsWith.length > 0 && (
        <p className={styles.overlap} data-testid="overlap-warning">
          Пересекается с {overlapsWith.map((t) => `«${t}»`).join(", ")}
        </p>
      )}
      {invalidMessage && <p className={styles.invalid}>{invalidMessage}</p>}
    </article>
  );
}
