import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAppState } from "@/entities/auth/model/useAppState";
import { characterClasses } from "@/entities/character/model/classes";
import { friendsRepository } from "@/features/friends/api/friendsRepository";
import { parseFriendCode, savePendingFriendCode } from "@/features/friends/model/friendCode";
import { friendErrorMessage } from "@/features/friends/model/friendErrors";
import { friendsKeys } from "@/features/friends/model/useFriends";
import { useNotifications } from "@/shared/lib/notifications/context";
import { Button } from "@/shared/ui/Button/ui/Button";
import { LoadingScreen } from "@/shared/ui/LoadingScreen/LoadingScreen";

import styles from "./InvitePage.module.scss";

/**
 * /invite/:code — public.
 * Signed in with a character → add the friend at once → «Друзья» + toast.
 * Otherwise → remember the code (claimed after onboarding / sign-in by useClaimPendingFriendCode) and show
 * «{Имя} зовёт тебя в Dayforge» with «Начать».
 */
export function InvitePage() {
  const { code: rawCode = "" } = useParams();
  const code = parseFriendCode(rawCode);
  const { appState } = useAppState();

  if (appState === "loading") return <LoadingScreen />;
  if (appState === "ready" && code) return <AddNow code={code} />;
  return <InviteScreen code={code} signedIn={appState === "needs-onboarding"} />;
}

function AddNow({ code }: { code: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    friendsRepository
      .addFriendByCode(code)
      .then((r) => {
        void queryClient.invalidateQueries({ queryKey: friendsKeys.all });
        notify(r.alreadyFriends ? "Уже в друзьях" : `Вы теперь друзья с ${r.name}`, "success");
      })
      .catch((err: unknown) => notify(friendErrorMessage(err), "error"))
      .finally(() => navigate("/app/friends", { replace: true }));
  }, [code, navigate, notify, queryClient]);

  return <LoadingScreen />;
}

function InviteScreen({ code, signedIn }: { code: string | null; signedIn: boolean }) {
  const navigate = useNavigate();
  const preview = useQuery({
    queryKey: ["invite-preview", code],
    queryFn: () => friendsRepository.getInvitePreview(code!),
    enabled: code !== null,
    retry: 1,
    staleTime: Infinity,
  });

  // remember the invite only when it points to a real player
  useEffect(() => {
    if (code && preview.data) savePendingFriendCode(code);
  }, [code, preview.data]);

  if (code && preview.isLoading) return <LoadingScreen />;

  const inviter = preview.data;
  const charClass = inviter?.classId
    ? characterClasses.find((c) => c.id === inviter.classId)
    : null;

  return (
    <main className={styles.page}>
      <div className={styles.card} data-testid="invite-screen">
        <p className={styles.logo}>DAYFORGE</p>
        {inviter ? (
          <>
            {charClass && (
              <div className={styles.classIcon} aria-hidden="true">
                {charClass.avatarIcon}
              </div>
            )}
            <h1 className={styles.title} data-testid="invite-title">
              {inviter.name} зовёт тебя в Dayforge
            </h1>
            <p className={styles.text}>
              {charClass ? `${charClass.name}. ` : ""}Прокачивай персонажа реальными делами — и
              смотри, как растут друзья.
            </p>
            <Button
              size="lg"
              fullWidth
              onClick={() => navigate("/onboarding")}
              data-testid="invite-start"
            >
              Начать
            </Button>
            {!signedIn && (
              <Link to="/login" className={styles.link}>
                У меня уже есть аккаунт
              </Link>
            )}
          </>
        ) : (
          <>
            <h1 className={styles.title} data-testid="invite-title">
              {preview.isError ? "Не удалось открыть приглашение" : "Приглашение недействительно"}
            </h1>
            <p className={styles.text}>
              {preview.isError
                ? "Проверь связь и открой ссылку ещё раз."
                : "Ссылка устарела или в ней ошибка. Попроси друга прислать новую."}
            </p>
            <Button size="lg" fullWidth onClick={() => navigate("/")}>
              На главную
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
