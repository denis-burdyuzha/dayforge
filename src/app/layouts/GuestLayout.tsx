import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAppState } from "@/entities/auth/model/useAppState";
import { LoadingScreen } from "@/shared/ui/LoadingScreen/LoadingScreen";

const GUEST_ONLY_PATHS = ["/", "/login", "/onboarding"];

export const GuestLayout = () => {
  const { appState } = useAppState();
  const location = useLocation();

  if (appState === "loading") {
    return <LoadingScreen />;
  }

  if (appState === "ready") {
    if (GUEST_ONLY_PATHS.includes(location.pathname)) {
      return <Navigate to="/app" replace />;
    }
  }

  if (appState === "needs-onboarding" && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};
