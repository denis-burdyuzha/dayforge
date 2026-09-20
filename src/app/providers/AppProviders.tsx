import type { ReactNode } from "react";

import { ErrorBoundary } from "./ErrorBoundary";
import { NotificationProvider } from "./notification/NotificationProvider";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./theme/ThemeProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <QueryProvider>{children}</QueryProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
