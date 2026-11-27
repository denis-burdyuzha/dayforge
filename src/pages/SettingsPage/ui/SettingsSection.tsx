import type { ReactNode } from "react";

import { Card } from "@/shared/ui/Card/ui/Card";

import styles from "../SettingsPage.module.scss";

interface SettingsSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

/** One titled block of the settings page — every section renders through it */
export function SettingsSection({ id, title, children }: SettingsSectionProps) {
  return (
    <section
      aria-labelledby={`settings-${id}`}
      className={styles.section}
      data-testid={`settings-${id}`}
    >
      <h2 id={`settings-${id}`} className={styles.sectionTitle}>
        {title}
      </h2>
      <Card className={styles.card}>{children}</Card>
    </section>
  );
}
