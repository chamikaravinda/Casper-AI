"use client";

import { Minus, Plus, Maximize2, Undo2, Redo2 } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useUndo, useRedo, useCanUndo, useCanRedo } from "@liveblocks/react";

const ZOOM_DURATION = 250; // ms — feels smooth without being slow

interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ControlButton({ onClick, disabled, title, children }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150 focus:outline-none"
      style={{
        color: disabled ? "rgba(248,250,252,0.25)" : "rgba(248,250,252,0.75)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "rgba(248,250,252,0.08)";
          (e.currentTarget as HTMLButtonElement).style.color =
            "rgba(248,250,252,1)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = disabled
          ? "rgba(248,250,252,0.25)"
          : "rgba(248,250,252,0.75)";
      }}
    >
      {children}
    </button>
  );
}

export function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  return (
    <div
      // Positioned bottom-left, above the shape panel toolbar
      className="absolute bottom-6 left-6 z-30 flex items-center gap-0.5 px-1.5 py-1 bg-bg-surface/90 backdrop-blur-md border border-border-subtle rounded-full shadow-2xl select-none"
    >
      {/* Zoom controls */}
      <ControlButton title="Zoom out (−)" onClick={() => zoomOut({ duration: ZOOM_DURATION })}>
        <Minus className="h-4 w-4 stroke-[1.75]" />
      </ControlButton>

      <ControlButton title="Fit view (F)" onClick={() => fitView({ duration: ZOOM_DURATION, padding: 0.15 })}>
        <Maximize2 className="h-4 w-4 stroke-[1.75]" />
      </ControlButton>

      <ControlButton title="Zoom in (+)" onClick={() => zoomIn({ duration: ZOOM_DURATION })}>
        <Plus className="h-4 w-4 stroke-[1.75]" />
      </ControlButton>

      {/* Divider */}
      <div
        className="mx-1 h-4 w-px"
        style={{ backgroundColor: "rgba(248,250,252,0.12)" }}
        aria-hidden
      />

      {/* History controls */}
      <ControlButton title="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo}>
        <Undo2 className="h-4 w-4 stroke-[1.75]" />
      </ControlButton>

      <ControlButton title="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={!canRedo}>
        <Redo2 className="h-4 w-4 stroke-[1.75]" />
      </ControlButton>
    </div>
  );
}
