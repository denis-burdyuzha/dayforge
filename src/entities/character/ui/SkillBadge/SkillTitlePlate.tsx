import type { SkillView } from "../../model/skillPresentation";
import styles from "./SkillBadge.module.scss";
import { SkillIcon } from "./SkillIcon";

export interface SkillTitlePlateProps {
  /** the title skill (pickTitleSkill); null → nothing is rendered */
  skill: SkillView | null;
  className?: string | undefined;
}

/** Title plate under the avatar: skill icon (20px) in its form ring + «{ранг} · {навык}» */
export function SkillTitlePlate({ skill, className }: SkillTitlePlateProps) {
  if (!skill) return null;
  const text = `${skill.rank} · ${skill.name}`;
  return (
    <div
      className={[styles.plate, className ?? ""].filter(Boolean).join(" ")}
      data-testid="skill-title-plate"
      title={`${text} · ур. ${skill.level} · форма ${skill.form}%`}
    >
      <SkillIcon
        name={skill.name}
        primaryAttribute={skill.primaryAttribute}
        form={skill.form}
        size={28}
        iconSize={20}
      />
      <span className={styles.plateText}>{text}</span>
    </div>
  );
}
