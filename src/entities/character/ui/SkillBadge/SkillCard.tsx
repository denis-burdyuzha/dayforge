import type { SkillView } from "../../model/skillPresentation";
import type { AttributeKey } from "../../model/types";
import { AttributeRune } from "../AttributeRuneRing/AttributeRune";
import styles from "./SkillBadge.module.scss";
import { SkillIcon } from "./SkillIcon";

export interface SkillCardProps {
  skill: SkillView;
  /** current character attribute values — the small runes show the same state as in the ring */
  attributeValues: Partial<Record<AttributeKey, number>>;
}

/** Skill row: icon in form ring (32px) · name · «ур. N · ранг» · «Форма N%» · runes of tied attributes */
export function SkillCard({ skill, attributeValues }: SkillCardProps) {
  return (
    <div className={styles.card} data-testid="skill-card">
      <SkillIcon
        name={skill.name}
        primaryAttribute={skill.primaryAttribute}
        form={skill.form}
        size={32}
        iconSize={20}
      />
      <div className={styles.cardBody}>
        <span className={styles.cardName}>{skill.name}</span>
        <span className={styles.cardMeta}>
          ур. {skill.level} · {skill.rank}
        </span>
        <span className={styles.cardForm}>Форма {skill.form}%</span>
      </div>
      {skill.attributes.length > 0 && (
        <div className={styles.cardRunes}>
          {skill.attributes.map((a) => (
            <AttributeRune key={a} attribute={a} value={attributeValues[a] ?? 1} size={16} />
          ))}
        </div>
      )}
    </div>
  );
}
