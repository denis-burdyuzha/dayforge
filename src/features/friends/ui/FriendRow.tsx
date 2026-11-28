import { Link } from "react-router-dom";

import { characterClasses } from "@/entities/character/model/classes";
import { ModularAvatar } from "@/entities/character/ui/ModularAvatar";
import { StreakBadge } from "@/entities/character/ui/Streak";

import type { FriendCard } from "../model/friendTypes";
import { friendAvatarParams, friendTitleSkill, summaryLine } from "../model/friendView";
import styles from "./Friends.module.scss";

/** A friend in the list: mini avatar (no rune ring), name, class · level, title, streak, today's summary */
export function FriendRow({ friend }: { friend: FriendCard }) {
  const charClass = characterClasses.find((c) => c.id === friend.classId);
  const title = friendTitleSkill(friend);
  return (
    <li>
      <Link to={`/app/friends/${friend.userId}`} className={styles.row} data-testid="friend-row">
        <div className={styles.rowAvatar} aria-hidden="true">
          <ModularAvatar params={friendAvatarParams(friend)} size={52} />
        </div>
        <div className={styles.rowBody}>
          <div className={styles.rowTop}>
            <span className={styles.rowName} data-testid="friend-name">
              {friend.name}
            </span>
            <StreakBadge value={friend.streak} active={friend.todayDone} />
          </div>
          <p className={styles.rowMeta}>
            {charClass ? `${charClass.name} · ` : ""}ур. {friend.level}
            {title ? ` · ${title.rank} · ${title.name}` : ""}
          </p>
          <p
            className={[styles.rowSummary, friend.summary ? "" : styles.muted].join(" ")}
            data-testid="friend-summary"
          >
            {summaryLine(friend.summary)}
          </p>
        </div>
      </Link>
    </li>
  );
}
