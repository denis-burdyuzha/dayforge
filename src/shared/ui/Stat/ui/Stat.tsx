import type { ReactNode } from "react";

import styles from "./Stat.module.scss";

interface StatProps {
  name: string;
  value: number;
  icon?: ReactNode;
  change?: number;
  progress?: number;
}

export function Stat({ name, value, icon, change, progress }: StatProps) {
  const hasChange = typeof change === "number" && change !== 0;
  const isPositive = (change ?? 0) > 0;

  return (
    <div className={styles.stat}>
      <div className={styles.header}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.name}>{name}</span>
      </div>

      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>

        {hasChange && (
          <span
            className={[styles.change, isPositive ? styles.positive : styles.negative].join(" ")}
          >
            {isPositive ? "+" : ""}
            {change}
          </span>
        )}
      </div>

      {typeof progress === "number" && (
        <div className={styles.track}>
          <div
            className={styles.progressValue}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
