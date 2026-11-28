import { useNavigate } from "react-router-dom";

import { useAppState } from "@/entities/auth/model/useAppState";
import { useCharacter } from "@/entities/character/model/useCharacter";
import { Avatar } from "@/shared/ui/Avatar/ui/Avatar";
import { Badge } from "@/shared/ui/Badge/ui/Badge";

import styles from "./Header.module.scss";

export function Header() {
  const navigate = useNavigate();
  const { session } = useAppState();
  const userId = session?.user?.id;

  // Reuses the same TanStack Query cache as HomePage — no duplicate request
  const { data: character } = useCharacter(userId);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* ── Brand ────────────────────────────────── */}
        <span className={styles.brand}>DAYFORGE</span>

        {/* ── Profile: opens the settings ───────────── */}
        {character && (
          <button
            className={styles.characterBtn}
            onClick={() => navigate("/app/settings")}
            aria-label={`Профиль и настройки: ${character.name}, уровень ${character.level}`}
            data-testid="profile-btn"
          >
            <Avatar size="sm" />
            <span className={styles.characterName} data-testid="header-name">
              {character.name}
            </span>
            <Badge variant="primary" className={styles.levelBadge}>
              Lv.&nbsp;{character.level}
            </Badge>
          </button>
        )}
      </div>
    </header>
  );
}
