"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CanvasErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught canvas connection or rendering error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-bg-base p-6 text-center">
          <div className="max-w-md space-y-6 border border-border-default bg-bg-surface p-8 rounded-3xl relative overflow-hidden shadow-2xl">
            {/* Top error accent bar */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-state-error/40" />

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-state-error/10 text-state-error">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-text-primary">Canvas Connection Failed</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                An issue was encountered establishing a collaborative connection for this project room. Please ensure you have access permissions.
              </p>
              {this.state.error && (
                <div className="mt-2 text-xs text-state-error font-mono bg-state-error/5 border border-state-error/10 rounded-xl p-3 max-h-24 overflow-auto text-left">
                  {this.state.error.message || "Unknown error"}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-center">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="gap-2 border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-subtle"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Connection
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
