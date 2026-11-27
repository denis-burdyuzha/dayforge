import type { ReactNode } from "react";

import { useAppState } from "@/entities/auth/model/useAppState";
import type { Profile } from "@/entities/profile/model/profileTypes";
import { useProfile } from "@/entities/profile/model/useProfile";
import { Loading } from "@/shared/ui/Loading/ui/Loading";

import styles from "./SettingsPage.module.scss";
import { AccountSection } from "./ui/AccountSection";
import { CharacterSection } from "./ui/CharacterSection";
import { DaySection } from "./ui/DaySection";

/** What every section receives */
interface SectionContext {
  userId: string;
  email: string | undefined;
  profile: Profile;
}

/**
 * The sections of the page in display order. A new section is one component + one entry here
 * (the next tasks add «Персонаж» and «Приватность» this way).
 */
const SECTIONS: ReadonlyArray<{ id: string; render: (ctx: SectionContext) => ReactNode }> = [
  { id: "character", render: ({ userId }) => <CharacterSection userId={userId} /> },
  { id: "account", render: ({ email }) => <AccountSection email={email} /> },
  { id: "day", render: ({ userId, profile }) => <DaySection userId={userId} profile={profile} /> },
];

export function SettingsPage() {
  const { session } = useAppState();
  const userId = session?.user?.id;
  const { data: profile, isLoading } = useProfile(userId);

  if (!userId || isLoading || !profile) {
    return (
      <div className={styles.center}>
        <Loading label="Загружаем настройки…" />
      </div>
    );
  }

  const ctx: SectionContext = { userId, email: session?.user?.email, profile };
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Настройки</h1>
      {SECTIONS.map((section) => (
        <div key={section.id}>{section.render(ctx)}</div>
      ))}
    </div>
  );
}
