import type { HTMLAttributes } from "react";

import styles from "./Card.module.scss";

type CardVariant = "default" | "interactive" | "highlight";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({ variant = "default", className, ...props }: CardProps) {
  const classes = [styles.card, styles[variant], className ?? ""].filter(Boolean).join(" ");

  return <div className={classes} {...props} />;
}
