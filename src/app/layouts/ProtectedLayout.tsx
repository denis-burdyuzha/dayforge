import { Navigate, Outlet } from "react-router-dom";

import { useAppState } from "@/entities/auth/model/useAppState";
import { useTimezoneSync } from "@/entities/profile/model/useTimezoneSync";
import { LoadingScreen } from "@/shared/ui/LoadingScreen/LoadingScreen";

export const ProtectedLayout = () => {
  const { appState, session } = useAppState();
  // keep profiles.timezone equal to the device zone (on every app entry)
  useTimezoneSync(appState === "ready" ? session?.user?.id : undefined);

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
