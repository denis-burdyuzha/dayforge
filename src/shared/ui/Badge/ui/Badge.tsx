import type { HTMLAttributes } from "react";

import styles from "./Badge.module.scss";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "xp";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  const classes = [styles.badge, styles[variant], className ?? ""].filter(Boolean).join(" ");

  return <span className={classes} {...props} />;
}
