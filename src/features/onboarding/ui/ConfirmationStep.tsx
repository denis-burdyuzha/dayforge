import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { characterClasses, startingDirections } from "@/entities/character/model/classes";
import { onboardingRepository } from "@/features/onboarding/api/onboardingRepository";
import { supabase } from "@/shared/api/supabase/client";
import { Badge } from "@/shared/ui/Badge/ui/Badge";
import { Button } from "@/shared/ui/Button/ui/Button";
import { Input } from "@/shared/ui/Input/ui/Input";

import type { OnboardingFormValues } from "../model/schema";
import confirmationStyles from "./ConfirmationStep.module.css";
import styles from "./StepLayout.module.css";

const registerSchema = z.object({
  email: z.string().trim().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

interface ConfirmationStepProps {
  values: OnboardingFormValues;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  error: string | null;
}

export function ConfirmationStep({ values, onBack }: ConfirmationStepProps) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const hasCompletedRef = useRef(false);

  const selectedClass = characterClasses.find((item) => item.id === values.classId);

  const selectedDirectionLabels = startingDirections
    .filter((direction) => values.startingDirections.includes(direction.id))
    .map((direction) => direction.label);

  const accentColor = selectedClass?.accentColor ?? "var(--color-primary)";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
      }
    });
  }, []);

  const executeCompletion = async () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    setIsFlashing(true);
    setIsSubmitting(true);
    try {
      await onboardingRepository.complete(values);
      localStorage.removeItem("dayforge:onboarding:draft");
      navigate("/app", { replace: true });
    } catch (err) {
      hasCompletedRef.current = false;
      setAuthError(err instanceof Error ? err.message : "Не удалось создать персонажа.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setErrors({});

    const validation = registerSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const issue of validation.error.issues) {
        if (issue.path[0] === "email") fieldErrors.email = issue.message;
        if (issue.path[0] === "password") fieldErrors.password = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setAuthError(signUpError.message);
        setIsSubmitting(false);
        return;
      }

      const activeSession = authData.session ?? (await supabase.auth.getSession()).data.session;

      if (!activeSession) {
        setAuthError(
          "Регистрация прошла, но сессия не активна. Если включено подтверждение по email, подтвердите вход.",
        );
        setIsSubmitting(false);
        return;
      }

      await executeCompletion();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Не удалось зарегистрироваться.");
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError(null);
    try {
      const draft = {
        username: values.username,
        characterName: values.characterName,
        classId: values.classId,
        startingDirections: values.startingDirections,
      };
      localStorage.setItem("dayforge:onboarding:draft", JSON.stringify(draft));

      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        setAuthError(error.message);
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Не удалось запустить Google вход.");
    }
  };

  return (
    <div className={styles.step}>
      {isFlashing && (
        <div className={confirmationStyles.flashOverlay} style={{ backgroundColor: accentColor }} />
      )}

      <h2 className={styles.title}>ТВОЙ ПЕРСОНАЖ ГОТОВ</h2>

      <div className={confirmationStyles.reveal}>
        <div
          className={confirmationStyles.levelBadge}
          style={
            {
              color: accentColor,
              textShadow: `0 0 16px ${accentColor}`,
            } as React.CSSProperties
          }
        >
          LEVEL 1
        </div>

        <div className={confirmationStyles.heroAvatar}>{selectedClass?.avatarIcon ?? "⚔️"}</div>

        <span className={confirmationStyles.characterName}>
          {values.characterName || values.username || "Hero"}
        </span>

        <span className={confirmationStyles.className} style={{ color: accentColor }}>
          {selectedClass?.name.toUpperCase()}
        </span>

        <div className={confirmationStyles.directions}>
          {selectedDirectionLabels.map((label) => (
            <Badge key={label} variant="default">
              {label} ✓
            </Badge>
          ))}
        </div>
      </div>

      <p className={confirmationStyles.subtitleInfo}>
        Создай аккаунт, чтобы сохранить персонажа и продолжить игру с любого устройства.
      </p>

      {authError && <div className={confirmationStyles.errorBanner}>{authError}</div>}

      {isAuthenticated ? (
        <div className={confirmationStyles.authBox}>
          <Button
            size="lg"
            fullWidth
            onClick={executeCompletion}
            disabled={isSubmitting}
            style={{
              backgroundColor: accentColor,
              borderColor: accentColor,
            }}
          >
            {isSubmitting ? "Сохранение..." : "СОХРАНИТЬ И НАЧАТЬ ИГРУ"}
          </Button>
        </div>
      ) : (
        <div className={confirmationStyles.authBox}>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleGoogleAuth}
            disabled={isSubmitting}
          >
            G Продолжить с Google
          </Button>

          <div className={confirmationStyles.divider}>
            <span>или</span>
          </div>

          <form className={confirmationStyles.registerForm} onSubmit={handleEmailRegister}>
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
              placeholder="Минимум 6 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              {...(errors.password ? { error: errors.password } : {})}
            />

            <Button
              type="submit"
              size="lg"
              fullWidth
              disabled={isSubmitting}
              style={{
                backgroundColor: accentColor,
                borderColor: accentColor,
              }}
            >
              {isSubmitting ? "Создание аккаунта..." : "Создать аккаунт"}
            </Button>
          </form>

          <div className={confirmationStyles.footerLink}>
            <button
              type="button"
              className={confirmationStyles.linkButton}
              onClick={() => navigate("/login")}
            >
              Уже есть аккаунт? Войти
            </button>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onBack} disabled={isSubmitting}>
          Назад
        </Button>
      </div>
    </div>
  );
}
