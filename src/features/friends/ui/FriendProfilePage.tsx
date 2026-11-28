import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { characterClasses } from "@/entities/character/model/classes";
import { AttributeRuneRing } from "@/entities/character/ui/AttributeRuneRing";
import { ModularAvatar } from "@/entities/character/ui/ModularAvatar";
import { SkillTitlePlate } from "@/entities/character/ui/SkillBadge";
import { StreakBadge, StreakWeek } from "@/entities/character/ui/Streak";
import { useNotifications } from "@/shared/lib/notifications/context";
import { Badge } from "@/shared/ui/Badge/ui/Badge";
import { Button } from "@/shared/ui/Button/ui/Button";
import { ErrorState } from "@/shared/ui/ErrorState/ui/ErrorState";
import { Loading } from "@/shared/ui/Loading/ui/Loading";
import { Modal } from "@/shared/ui/Modal/ui/Modal";

import { friendsRepository } from "../api/friendsRepository";
import { friendErrorMessage } from "../model/friendErrors";
import { friendAvatarParams, friendTitleSkill, summaryLine } from "../model/friendView";
import { friendsKeys, useFriendProfile } from "../model/useFriends";
import styles from "./Friends.module.scss";

const RING_SIZE = 300;

const dayLabel = new Intl.DateTimeFormat("ru-RU", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

function formatDay(date: string, index: number): string {
  if (index === 0) return "Сегодня";
  if (index === 1) return "Вчера";
  const d = new Date(`${date}T12:00:00`);
  return Number.isNaN(d.getTime()) ? date : dayLabel.format(d);
}

/** /app/friends/:userId — a friend's character: rune ring + sigil, title, level, streak, week, last 7 days */
export function FriendProfilePage() {
  const { userId } = useParams();
  const profile = useFriendProfile(userId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const back = (
    <Link to="/app/friends" className={styles.back}>
      <ChevronLeft size={18} aria-hidden="true" />
      Друзья
    </Link>
  );

  if (profile.isLoading) {
    return (
      <div className={styles.page}>
        {back}
        <Loading label="Загружаем профиль…" />
      </div>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <div className={styles.page}>
        {back}
        <ErrorState
          title={friendErrorMessage(profile.error)}
          description="Вернись к списку друзей."
          action={
            <Button variant="secondary" onClick={() => navigate("/app/friends")}>
              К друзьям
            </Button>
          }
        />
      </div>
    );
  }

  const friend = profile.data;
  const params = friendAvatarParams(friend);
  const title = friendTitleSkill(friend);
  const charClass = characterClasses.find((c) => c.id === friend.classId);

  async function remove() {
    setRemoving(true);
    try {
      await friendsRepository.removeFriend(friend.userId);
      queryClient.removeQueries({ queryKey: friendsKeys.profile(friend.userId) });
      await queryClient.invalidateQueries({ queryKey: friendsKeys.list() });
      notify(`${friend.name} больше не в друзьях`, "success");
      navigate("/app/friends", { replace: true });
    } catch (err) {
      notify(friendErrorMessage(err), "error");
      setRemoving(false);
    }
  }

  return (
    <div className={styles.page} data-testid="friend-profile">
      {back}

      <section className={styles.hero}>
        <AttributeRuneRing attributes={params.attributeValues} size={RING_SIZE} showAspectSigil>
          <ModularAvatar params={params} size={150} />
        </AttributeRuneRing>
        <h1 className={styles.heroName} data-testid="friend-profile-name">
          {friend.name}
        </h1>
        <SkillTitlePlate skill={title} />
        <div className={styles.heroMeta}>
          {charClass && (
            <Badge variant="primary">
              {charClass.avatarIcon}&nbsp;{charClass.name}
            </Badge>
          )}
          <span className={styles.level}>Уровень {friend.level}</span>
        </div>
      </section>

      <section className={styles.block} aria-label="Серия">
        <div className={styles.streakHead}>
          <StreakBadge value={friend.streak} active={friend.todayDone} />
          <span className={styles.muted} data-testid="friend-longest">
            Рекорд: {friend.longest}
          </span>
        </div>
        <StreakWeek days={friend.week} />
      </section>

      <section className={styles.block} aria-labelledby="friend-days">
        <h2 id="friend-days" className={styles.sectionTitle}>
          Последние 7 дней
        </h2>
        {friend.days ? (
          <ul className={styles.days} data-testid="friend-days">
            {friend.days.map((d, i) => (
              <li key={d.date} className={styles.dayRow}>
                <span className={styles.dayName}>{formatDay(d.date, i)}</span>
                <span className={styles.daySummary}>
                  {summaryLine(d, i === 0 ? "Пока ничего" : "Ничего")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted} data-testid="friend-days-hidden">
            {friend.name} скрывает сводку дня
          </p>
        )}
      </section>

      <Button
        variant="ghost"
        fullWidth
        onClick={() => setConfirmOpen(true)}
        data-testid="remove-friend"
      >
        Удалить из друзей
      </Button>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Удалить из друзей?">
        <p className={styles.confirmText}>
          {friend.name} пропадёт из твоего списка, а ты — из списка {friend.name}. Добавиться снова
          можно по коду.
        </p>
        <div className={styles.confirmActions}>
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            Отмена
          </Button>
          <Button
            variant="danger"
            onClick={() => void remove()}
            disabled={removing}
            data-testid="remove-friend-confirm"
          >
            {removing ? "Удаляю…" : "Удалить"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
