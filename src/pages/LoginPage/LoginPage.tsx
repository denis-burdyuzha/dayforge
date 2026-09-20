import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { supabase } from "@/shared/api/supabase/client";
import { Button } from "@/shared/ui/Button/ui/Button";
import { Input } from "@/shared/ui/Input/ui/Input";

import styles from "./LoginPage.module.css";

const loginSchema = z.object({
  email: z.string().trim().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const issue of validation.error.issues) {
        if (issue.path[0] === "email") fieldErrors.email = issue.message;
        if (issue.path[0] === "password") fieldErrors.password = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(
          error.message === "Invalid login credentials"
            ? "Неверный email или пароль"
            : error.message,
        );
      } else {
        navigate("/app", { replace: true });
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Не удалось войти. Попробуйте ещё раз.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) {
        setAuthError(error.message);
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Не удалось войти через Google.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.logo}>DAYFORGE</h1>
          <p className={styles.subtitle}>Вход в аккаунт</p>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          <Input
            label="Email"
            type="email"
            placeholder="hero@dayforge.app"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            {...(errors.email ? { error: errors.email } : {})}
          />

          <Input
            label="Пароль"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            {...(errors.password ? { error: errors.password } : {})}
          />

          {authError && <div className={styles.errorBanner}>{authError}</div>}

          <Button type="submit" size="lg" fullWidth disabled={isLoading}>
            {isLoading ? "Вход..." : "Войти"}
          </Button>
        </form>

        <div className={styles.divider}>
          <span>или</span>
        </div>

        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          G Продолжить с Google
        </Button>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => navigate("/onboarding")}
          >
            Нет аккаунта? Создать персонажа
          </button>
        </div>
      </div>
    </div>
  );
}
