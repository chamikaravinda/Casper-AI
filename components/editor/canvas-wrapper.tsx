"use client";

import { ReactNode } from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { CanvasErrorBoundary } from "./error-boundary";
import { Loader2 } from "lucide-react";

interface CanvasWrapperProps {
  roomId: string;
  children: ReactNode;
}

export function CanvasWrapper({ roomId, children }: CanvasWrapperProps) {
  return (
    <CanvasErrorBoundary>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{
            cursor: null,
            isThinking: false,
          }}
        >
          <ClientSideSuspense
            fallback={
              <div className="flex h-full w-full flex-col items-center justify-center bg-bg-base text-center p-6">
                <div className="space-y-4">
                  <Loader2 className="h-8 w-8 text-accent-primary animate-spin mx-auto" />
                  <p className="text-xs font-mono text-text-muted">
                    Connecting to collaborative workspace...
                  </p>
                </div>
              </div>
            }
          >
            {children}
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </CanvasErrorBoundary>
  );
}
