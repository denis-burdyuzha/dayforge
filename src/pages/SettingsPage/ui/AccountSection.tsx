import { useState } from "react";

import { supabase } from "@/shared/api/supabase/client";
import { Button } from "@/shared/ui/Button/ui/Button";

import styles from "../SettingsPage.module.scss";
import { SettingsSection } from "./SettingsSection";

/** «Аккаунт»: the email of the signed-in user (read only) and «Выйти» */
export function AccountSection({ email }: { email: string | undefined }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    setBusy(true);
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError("Не удалось выйти — проверь соединение и попробуй ещё раз");
      setBusy(false);
      return;
    }
    // a full reload: the auth gate has already sent the signed-out app to /login, the landing is wanted, and
    // nothing of this account stays in memory (query cache, drafts in state) for the next one
    window.location.replace("/");
  }

  return (
    <SettingsSection id="account" title="Аккаунт">
      <div className={styles.readonlyRow}>
        <span className={styles.label}>Email</span>
        <span className={styles.readonlyValue} data-testid="account-email">
          {email ?? "—"}
        </span>
      </div>
      <Button
        type="button"
        variant="secondary"
        fullWidth
        onClick={() => void signOut()}
        disabled={busy}
        data-testid="sign-out-btn"
      >
        {busy ? "Выходим…" : "Выйти"}
      </Button>
      {error && (
        <p className={styles.message} role="alert">
          {error}
        </p>
      )}
    </SettingsSection>
  );
}
