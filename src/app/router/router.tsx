import { createBrowserRouter, Navigate } from "react-router-dom";

import { CalendarPage } from "@/features/calendar/ui/CalendarPage";
import { DailyPlanPage } from "@/features/daily-plan/ui/DailyPlanPage";
import { DailyReportPage } from "@/features/daily-report/ui/DailyReportPage";
import { FriendProfilePage } from "@/features/friends/ui/FriendProfilePage";
import { FriendsPage } from "@/features/friends/ui/FriendsPage";
import { OnboardingPage } from "@/features/onboarding/ui/OnboardingPage";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage/AuthCallbackPage";
import { AvatarPlaygroundPage } from "@/pages/AvatarPlaygroundPage/AvatarPlaygroundPage";
import HomePage from "@/pages/HomePage/HomePage";
import { InvitePage } from "@/pages/InvitePage/InvitePage";
import { LandingPage } from "@/pages/LandingPage/LandingPage";
import { LoginPage } from "@/pages/LoginPage/LoginPage";
import { SettingsPage } from "@/pages/SettingsPage/SettingsPage";

import { AppShell } from "../layouts/AppShell";
import { GuestLayout } from "../layouts/GuestLayout";
import { ProtectedLayout } from "../layouts/ProtectedLayout";

export const appRouter = createBrowserRouter([
  // Dev-only Playground Route
  {
    path: "/dev/avatar",
    element: <AvatarPlaygroundPage />,
  },
  // Guest accessible routes
  {
    element: <GuestLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/onboarding",
        element: <OnboardingPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  // Invite link: public, works signed in and out (see InvitePage)
  {
    path: "/invite/:code",
    element: <InvitePage />,
  },
  // OAuth Callback Route
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
  // Protected App Routes (/app/*)
  {
    path: "/app",
    element: <ProtectedLayout />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: "",
            element: <HomePage />,
          },
          {
            path: "plan",
            element: <DailyPlanPage />,
          },
          {
            path: "calendar",
            element: <CalendarPage />,
          },
          {
            path: "report",
            element: <DailyReportPage />,
          },
          {
            path: "friends",
            element: <FriendsPage />,
          },
          {
            path: "friends/:userId",
            element: <FriendProfilePage />,
          },
          {
            path: "report/review",
            element: <div>👀 Report Review Page </div>,
          },
          {
            path: "character",
            element: <div>🦸 Character Stats Page </div>,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
