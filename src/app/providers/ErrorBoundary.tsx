import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Dayforge error:", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <main>
          <h1>Что-то пошло не так</h1>
          <button type="button" onClick={() => window.location.reload()}>
            Перезагрузить
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
