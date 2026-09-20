import type { ReactNode } from "react";

import styles from "./Achievement.module.scss";

interface AchievementProps {
  title: string;
  description: string;
  icon?: ReactNode;
  unlocked?: boolean;
}

export function Achievement({
  title,
  description,
  icon = "🏆",
  unlocked = false,
}: AchievementProps) {
  const classes = [styles.achievement, unlocked ? styles.unlocked : styles.locked].join(" ");

  return (
    <div className={classes}>
      <span className={styles.icon}>{icon}</span>

      <div className={styles.body}>
        <span className={styles.title}>{title}</span>
        <span className={styles.description}>{description}</span>
      </div>

      <span className={styles.status}>{unlocked ? "UNLOCKED" : "LOCKED"}</span>
    </div>
  );
}
