import { Navigate, Outlet } from "react-router-dom";

import { useAppState } from "@/entities/auth/model/useAppState";
import { LoadingScreen } from "@/shared/ui/LoadingScreen/LoadingScreen";

export const ProtectedLayout = () => {
  const { appState } = useAppState();

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
