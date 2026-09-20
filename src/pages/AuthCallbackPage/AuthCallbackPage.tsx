import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { onboardingRepository } from "@/features/onboarding/api/onboardingRepository";
import { supabase } from "@/shared/api/supabase/client";
import { Button } from "@/shared/ui/Button/ui/Button";
import { LoadingScreen } from "@/shared/ui/LoadingScreen/LoadingScreen";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          if (isMounted) navigate("/login", { replace: true });
          return;
        }

        const draftString = localStorage.getItem("dayforge:onboarding:draft");

        if (draftString) {
          if (hasCompletedRef.current) return;
          hasCompletedRef.current = true;

          try {
            const draft = JSON.parse(draftString);
            await onboardingRepository.complete(draft);
            localStorage.removeItem("dayforge:onboarding:draft");
            if (isMounted) navigate("/app", { replace: true });
            return;
          } catch (err) {
            console.error("Failed to complete onboarding from draft:", err);
            hasCompletedRef.current = false;
            localStorage.removeItem("dayforge:onboarding:draft");
          }
        }

        // If no draft or draft completion failed, check if character exists
        const { data: character } = await supabase
          .from("characters")
          .select("id")
          .eq("profile_id", session.user.id)
          .maybeSingle();

        if (isMounted) {
          if (character) {
            navigate("/app", { replace: true });
          } else {
            navigate("/onboarding", { replace: true });
          }
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Произошла ошибка при обработке авторизации.",
          );
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "16px",
          padding: "16px",
          textAlign: "center",
          background: "var(--color-bg)",
        }}
      >
        <p style={{ color: "var(--color-danger)" }}>{error}</p>
        <Button onClick={() => navigate("/login", { replace: true })}>Вернуться ко входу</Button>
      </div>
    );
  }

  return <LoadingScreen />;
}
