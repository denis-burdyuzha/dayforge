import { Navigate, Outlet } from "react-router-dom";

import { useAppState } from "@/entities/auth/model/useAppState";
import { useTimezoneSync } from "@/entities/profile/model/useTimezoneSync";
import { useResendPendingCompletions } from "@/features/quest-completion/model/useResendPendingCompletions";
import { LoadingScreen } from "@/shared/ui/LoadingScreen/LoadingScreen";

export const ProtectedLayout = () => {
  const { appState, session } = useAppState();
  // keep profiles.timezone equal to the device zone (on every app entry)
  useTimezoneSync(appState === "ready" ? session?.user?.id : undefined);
  // quest completions a closed / killed tab did not send are sent now
  useResendPendingCompletions(appState === "ready");

  if (appState === "loading") {
    return <LoadingScreen />;
  }

  if (appState === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (appState === "needs-onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};
