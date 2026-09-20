import styles from "./XPBar.module.scss";

interface XPBarProps {
  level: number;
  currentXp: number;
  requiredXp: number;
}

export function XPBar({ level, currentXp, requiredXp }: XPBarProps) {
  const progress = Math.min(100, (currentXp / requiredXp) * 100);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span>Уровень {level}</span>
        <span>
          {currentXp} / {requiredXp} XP
        </span>
      </div>

      <div className={styles.track}>
        <div className={styles.value} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
