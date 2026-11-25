import { useState } from "react";

import { ATTRIBUTE_LABELS_RU, ATTRIBUTE_ORDER } from "@/entities/character/model/aspect";
import type { SkillView } from "@/entities/character/model/skillPresentation";
import type { AttributeKey } from "@/entities/character/model/types";
import { AttributeRune } from "@/entities/character/ui/AttributeRuneRing";
import { SkillIcon } from "@/entities/character/ui/SkillBadge";
import {
  DAY_REPORT_LIMITS,
  type EditableDayEvent,
} from "@/entities/daily-report/model/aiDayReport";
import {
  FALLBACK_SKILL_ICON_KEY,
  getSkillIconByKey,
  SKILL_ICON_OPTIONS,
} from "@/shared/config/skillIcons";

import styles from "./AiDayReport.module.scss";

interface DayEventCardProps {
  event: EditableDayEvent;
  skills: SkillView[];
  /** title of the planned quest the event is linked to */
  plannedQuestTitle: string | null;
  invalidMessage: string | null;
  onChange: (patch: Partial<EditableDayEvent>) => void;
}

const NEW = "__new__";
const NONE = "__none__";

/** One parsed event in the preview: on/off, hours, skill (existing / new / none), planned-quest label */
export function DayEventCard({
  event,
  skills,
  plannedQuestTitle,
  invalidMessage,
  onChange,
}: DayEventCardProps) {
  const [iconsOpen, setIconsOpen] = useState(false);
  const skill = event.skill;
  const existing =
    skill.kind === "existing" ? skills.find((s) => s.id === skill.skillId) : undefined;
  const selectValue = skill.kind === "existing" ? skill.skillId : skill.kind === "new" ? NEW : NONE;

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
      className={[styles.card, event.enabled ? "" : styles.cardOff].filter(Boolean).join(" ")}
      data-testid="day-event-card"
      data-skill-kind={skill.kind}
    >
      <label className={styles.cardHeader}>
        <input
          type="checkbox"
          checked={event.enabled}
          onChange={(e) => onChange({ enabled: e.target.checked })}
          aria-label="Учитывать событие"
        />
        <span className={styles.cardTitle}>{event.description}</span>
        {event.confidence === "low" && <span className={styles.lowBadge}>Проверь</span>}
      </label>

      {event.confidence === "low" && event.note && <p className={styles.note}>{event.note}</p>}

      <div className={styles.cardRow}>
        <label className={styles.hours}>
          <input
            type="number"
            inputMode="decimal"
            min={DAY_REPORT_LIMITS.hoursMin}
            max={DAY_REPORT_LIMITS.hoursMax}
            step={DAY_REPORT_LIMITS.hoursStep}
            value={Number.isFinite(event.hours) ? event.hours : ""}
            onChange={(e) => onChange({ hours: e.target.valueAsNumber })}
            disabled={!event.enabled}
            aria-label="Часы"
          />
          <span>ч</span>
        </label>
        {plannedQuestTitle && (
          <span className={styles.questTag}>Из плана: {plannedQuestTitle}</span>
        )}
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
        <select
          className={styles.skillSelect}
          value={selectValue}
          onChange={(e) => selectSkill(e.target.value)}
          disabled={!event.enabled}
          aria-label="Навык"
        >
          {skills.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
          <option value={NEW}>+ Новый навык</option>
          <option value={NONE}>Без навыка</option>
        </select>
      </div>

      {skill.kind === "new" && event.enabled && (
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

      {invalidMessage && <p className={styles.invalid}>{invalidMessage}</p>}
    </article>
  );
}
