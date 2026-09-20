import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { supabase } from "@/shared/api/supabase/client";

export type AppState = "loading" | "unauthenticated" | "needs-onboarding" | "ready";

export function useAppState() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let isMounted = true;

    const determineState = async (currentSession: Session | null) => {
      if (!currentSession?.user) {
        if (isMounted) {
          setSession(null);
          setAppState("unauthenticated");
        }
        return;
      }

      if (isMounted) {
        setSession(currentSession);
      }

      try {
        const { data: character, error } = await supabase
          .from("characters")
          .select("id")
          .eq("profile_id", currentSession.user.id)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching character:", error);
        }

        if (isMounted) {
          setAppState(character ? "ready" : "needs-onboarding");
        }
      } catch (err) {
        console.error("Failed to determine app state:", err);
        if (isMounted) {
          setAppState("needs-onboarding");
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      determineState(initialSession);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      determineState(currentSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { appState, session };
}
