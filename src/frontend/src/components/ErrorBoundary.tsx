import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Dashboard render failed", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md rounded-lg border subtle-border bg-card p-5 text-center">
          <h1 className="font-display text-xl font-semibold text-foreground">
            Dashboard could not render
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The page hit an unexpected display error. Refreshing usually
            restores the live metrics.
          </p>
          {this.state.message && (
            <p className="mt-3 rounded-md bg-muted/40 px-3 py-2 text-xs font-mono text-muted-foreground">
              {this.state.message}
            </p>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md border border-border/70 px-3 py-2 text-xs font-mono text-foreground transition-smooth hover:border-accent/40 hover:text-accent"
          >
            Refresh dashboard
          </button>
        </div>
      </div>
    );
  }
}
