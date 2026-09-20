import type { TextareaHTMLAttributes } from "react";

import styles from "./Textarea.module.scss";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, ...props }: TextareaProps) {
  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}

      <textarea id={id} className={styles.textarea} aria-invalid={Boolean(error)} {...props} />

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
