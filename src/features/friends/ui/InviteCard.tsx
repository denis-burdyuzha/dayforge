import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Share2 } from "lucide-react";
import { useId, useState } from "react";

import { useNotifications } from "@/shared/lib/notifications/context";
import { Button } from "@/shared/ui/Button/ui/Button";
import { Modal } from "@/shared/ui/Modal/ui/Modal";

import { friendsRepository } from "../api/friendsRepository";
import { parseFriendCode } from "../model/friendCode";
import { friendErrorMessage } from "../model/friendErrors";
import { friendsKeys, useMyFriendCode } from "../model/useFriends";
import { useShareInvite } from "../model/useShareInvite";
import styles from "./Friends.module.scss";

/** «Пригласить друга»: my code, share / copy the link, enter a friend's code, «Сменить код» */
export function InviteCard() {
  const { data: my } = useMyFriendCode();
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const code = my?.code ?? "";

  const share = useShareInvite(code || undefined);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFriendCode(draft);
    if (!parsed) {
      setError("Код — 8 букв и цифр, например K7MX2QPA");
      return;
    }
    setAdding(true);
    setError(null);
    try {
      const r = await friendsRepository.addFriendByCode(parsed);
      setDraft("");
      void queryClient.invalidateQueries({ queryKey: friendsKeys.all });
      notify(r.alreadyFriends ? "Уже в друзьях" : `Вы теперь друзья с ${r.name}`, "success");
    } catch (err) {
      setError(friendErrorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  async function regenerate() {
    setRegenerating(true);
    try {
      await friendsRepository.regenerateFriendCode();
      await queryClient.invalidateQueries({ queryKey: friendsKeys.myCode() });
      notify("Код сменён — старые ссылки больше не работают", "success");
      setConfirmOpen(false);
    } catch (err) {
      notify(friendErrorMessage(err), "error");
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <section
      className={styles.inviteCard}
      aria-labelledby={`${inputId}-title`}
      data-testid="invite-card"
    >
      <div className={styles.inviteHead}>
        <h2 id={`${inputId}-title`} className={styles.inviteTitle}>
          Пригласить друга
        </h2>
        <div className={styles.menuWrap}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Ещё"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            data-testid="invite-menu"
          >
            <MoreHorizontal size={20} aria-hidden="true" />
          </button>
          {menuOpen && (
            <div className={styles.menu} role="menu">
              <button
                type="button"
                role="menuitem"
                className={styles.menuItem}
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmOpen(true);
                }}
                data-testid="regenerate-code"
              >
                Сменить код
              </button>
            </div>
          )}
        </div>
      </div>

      <p className={styles.codeLabel}>Твой код</p>
      <p className={styles.code} data-testid="my-friend-code">
        {code || "········"}
      </p>

      <Button fullWidth onClick={() => void share()} disabled={!code} data-testid="share-invite">
        <Share2 size={18} aria-hidden="true" />
        &nbsp;Пригласить
      </Button>

      <form className={styles.codeForm} onSubmit={(e) => void add(e)}>
        <label htmlFor={inputId} className={styles.codeFormLabel}>
          Ввести код друга
        </label>
        <div className={styles.codeRow}>
          <input
            id={inputId}
            className={styles.codeInput}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
            }}
            placeholder="K7MX2QPA"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={200}
            aria-invalid={error !== null}
            aria-describedby={error ? `${inputId}-error` : undefined}
            data-testid="friend-code-input"
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={adding || draft.trim() === ""}
            data-testid="friend-code-add"
          >
            {adding ? "…" : "Добавить"}
          </Button>
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className={styles.fieldError}
            role="alert"
            data-testid="friend-code-error"
          >
            {error}
          </p>
        )}
      </form>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Сменить код?">
        <p className={styles.confirmText}>
          Старый код и все отправленные ссылки перестанут работать. Друзья, которые уже добавлены,
          останутся.
        </p>
        <div className={styles.confirmActions}>
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={() => void regenerate()}
            disabled={regenerating}
            data-testid="regenerate-confirm"
          >
            {regenerating ? "Меняю…" : "Сменить"}
          </Button>
        </div>
      </Modal>
    </section>
  );
}
