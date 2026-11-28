import { Users } from "lucide-react";

import { Button } from "@/shared/ui/Button/ui/Button";
import { ErrorState } from "@/shared/ui/ErrorState/ui/ErrorState";
import { Loading } from "@/shared/ui/Loading/ui/Loading";

import { useFriends, useMyFriendCode } from "../model/useFriends";
import { useShareInvite } from "../model/useShareInvite";
import { FriendRow } from "./FriendRow";
import styles from "./Friends.module.scss";
import { InviteCard } from "./InviteCard";

/** «Друзья»: invite block + the list (the server sorts: done today first, then by streak) */
export function FriendsPage() {
  const friends = useFriends();
  const { data: my } = useMyFriendCode();
  const share = useShareInvite(my?.code);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Друзья</h1>
      <InviteCard />

      {friends.isLoading ? (
        <Loading label="Загружаем друзей…" />
      ) : friends.isError ? (
        <ErrorState
          title="Не удалось загрузить друзей"
          description="Проверь связь и попробуй ещё раз."
          action={
            <Button variant="secondary" onClick={() => void friends.refetch()}>
              Повторить
            </Button>
          }
        />
      ) : friends.data && friends.data.length > 0 ? (
        <section aria-label="Список друзей">
          <h2 className={styles.sectionTitle}>Друзья · {friends.data.length}</h2>
          <ul className={styles.list} data-testid="friends-list">
            {friends.data.map((f) => (
              <FriendRow key={f.userId} friend={f} />
            ))}
          </ul>
        </section>
      ) : (
        <div className={styles.empty} data-testid="friends-empty">
          <Users size={32} aria-hidden="true" />
          <p className={styles.emptyText}>
            Пока никого. Пригласи друга — вместе прокачиваться веселее
          </p>
          <Button
            variant="secondary"
            onClick={() => void share()}
            disabled={!my?.code}
            data-testid="empty-invite"
          >
            Пригласить друга
          </Button>
        </div>
      )}
    </div>
  );
}
