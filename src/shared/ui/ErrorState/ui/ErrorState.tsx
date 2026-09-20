import type { ReactNode } from "react";

import styles from "./ErrorState.module.scss";

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function ErrorState({
  title = "Что-то пошло не так",
  description,
  action,
}: ErrorStateProps) {
  return (
    <div className={styles.error}>
      <h2>{title}</h2>

      {description && <p>{description}</p>}

      {action && <div>{action}</div>}
    </div>
  );
}
