"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Square, Diamond, Circle, Pill, Cylinder, Hexagon } from "lucide-react";
import { NodeShape } from "@/types/canvas";

// ─── Shape config ────────────────────────────────────────────────────────────

const SHAPES_CONFIG = [
  {
    type: "rectangle" as NodeShape,
    icon: Square,
    label: "Rectangle",
    defaultWidth: 150,
    defaultHeight: 80,
  },
  {
    type: "diamond" as NodeShape,
    icon: Diamond,
    label: "Diamond",
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    type: "circle" as NodeShape,
    icon: Circle,
    label: "Circle",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    type: "pill" as NodeShape,
    icon: Pill,
    label: "Pill",
    defaultWidth: 120,
    defaultHeight: 60,
  },
  {
    type: "cylinder" as NodeShape,
    icon: Cylinder,
    label: "Cylinder",
    defaultWidth: 100,
    defaultHeight: 120,
  },
  {
    type: "hexagon" as NodeShape,
    icon: Hexagon,
    label: "Hexagon",
    defaultWidth: 110,
    defaultHeight: 100,
  },
] as const;

// ─── Ghost preview shape renderers ──────────────────────────────────────────

function GhostRectangle({ width, height }: { width: number; height: number }) {
  return (
    <div
      style={{ width, height }}
      className="rounded-xl border border-[#00c8d4]/60 bg-[#00c8d4]/10"
    />
  );
}

function GhostPill({ width, height }: { width: number; height: number }) {
  return (
    <div
      style={{ width, height, borderRadius: "9999px" }}
      className="border border-[#00c8d4]/60 bg-[#00c8d4]/10"
    />
  );
}

function GhostCircle({ width, height }: { width: number; height: number }) {
  const size = Math.min(width, height);
  return (
    <div
      style={{ width: size, height: size, borderRadius: "50%" }}
      className="border border-[#00c8d4]/60 bg-[#00c8d4]/10"
    />
  );
}

function GhostDiamond({ width, height }: { width: number; height: number }) {
  const cx = width / 2;
  const cy = height / 2;
  const points = `${cx},2 ${width - 2},${cy} ${cx},${height - 2} 2,${cy}`;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polygon
        points={points}
        fill="rgba(0,200,212,0.10)"
        stroke="rgba(0,200,212,0.60)"
        strokeWidth={1.5}
      />
    </svg>
  );
}

function GhostHexagon({ width, height }: { width: number; height: number }) {
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2 - 2;
  const ry = height / 2 - 2;
  const angles = [0, 60, 120, 180, 240, 300];
  const points = angles
    .map((deg) => {
      const rad = ((deg - 30) * Math.PI) / 180;
      return `${cx + rx * Math.cos(rad)},${cy + ry * Math.sin(rad)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polygon
        points={points}
        fill="rgba(0,200,212,0.10)"
        stroke="rgba(0,200,212,0.60)"
        strokeWidth={1.5}
      />
    </svg>
  );
}

function GhostCylinder({ width, height }: { width: number; height: number }) {
  const rx = width / 2 - 2;
  const ry = Math.max(12, height * 0.12);
  const cx = width / 2;
  const bodyTop = ry;
  const bodyBottom = height - ry;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <rect
        x={cx - rx}
        y={bodyTop}
        width={rx * 2}
        height={bodyBottom - bodyTop}
        fill="rgba(0,200,212,0.10)"
        stroke="rgba(0,200,212,0.60)"
        strokeWidth={1.5}
      />
      <ellipse
        cx={cx}
        cy={bodyBottom}
        rx={rx}
        ry={ry}
        fill="rgba(0,200,212,0.10)"
        stroke="rgba(0,200,212,0.60)"
        strokeWidth={1.5}
      />
      <ellipse
        cx={cx}
        cy={bodyTop}
        rx={rx}
        ry={ry}
        fill="rgba(0,200,212,0.10)"
        stroke="rgba(0,200,212,0.60)"
        strokeWidth={1.5}
      />
    </svg>
  );
}

// ─── Ghost preview portal ────────────────────────────────────────────────────

interface DragState {
  shape: NodeShape;
  width: number;
  height: number;
  x: number;
  y: number;
}

function GhostPreview({ drag }: { drag: DragState | null }) {
  if (!drag) return null;

  const { shape, width, height, x, y } = drag;

  const renderGhost = () => {
    switch (shape) {
      case "rectangle":
        return <GhostRectangle width={width} height={height} />;
      case "pill":
        return <GhostPill width={width} height={height} />;
      case "circle":
        return <GhostCircle width={width} height={height} />;
      case "diamond":
        return <GhostDiamond width={width} height={height} />;
      case "hexagon":
        return <GhostHexagon width={width} height={height} />;
      case "cylinder":
        return <GhostCylinder width={width} height={height} />;
      default:
        return <GhostRectangle width={width} height={height} />;
    }
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: x - width / 2,
        top: y - height / 2,
        pointerEvents: "none",
        zIndex: 9999,
        opacity: 0.75,
        transition: "none",
      }}
    >
      {renderGhost()}
    </div>,
    document.body
  );
}

// ─── Shape Panel ─────────────────────────────────────────────────────────────

export function ShapePanel() {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragStateRef.current) {
      const next = { ...dragStateRef.current, x: e.clientX, y: e.clientY };
      dragStateRef.current = next;
      setDragState({ ...next });
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    dragStateRef.current = null;
    setDragState(null);
  }, []);

  useEffect(() => {
    window.addEventListener("dragover", handleMouseMove as unknown as EventListener);
    window.addEventListener("dragend", handleDragEnd);
    window.addEventListener("drop", handleDragEnd);
    return () => {
      window.removeEventListener("dragover", handleMouseMove as unknown as EventListener);
      window.removeEventListener("dragend", handleDragEnd);
      window.removeEventListener("drop", handleDragEnd);
    };
  }, [handleMouseMove, handleDragEnd]);

  const onDragStart = (
    event: React.DragEvent,
    shape: NodeShape,
    width: number,
    height: number
  ) => {
    const payload = { shape, width, height };
    event.dataTransfer.setData("application/reactflow", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";

    // Suppress the browser's default drag image with an invisible element
    const ghost = document.createElement("div");
    ghost.style.cssText = "position:fixed;top:-1000px;left:-1000px;width:1px;height:1px;opacity:0;";
    document.body.appendChild(ghost);
    event.dataTransfer.setDragImage(ghost, 0, 0);
    requestAnimationFrame(() => document.body.removeChild(ghost));

    const initial: DragState = { shape, width, height, x: event.clientX, y: event.clientY };
    dragStateRef.current = initial;
    setDragState(initial);
  };

  return (
    <>
      <GhostPreview drag={dragState} />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-2 bg-bg-surface/90 backdrop-blur-md border border-border-subtle rounded-full shadow-2xl select-none">
        {SHAPES_CONFIG.map((shape) => (
          <div
            key={shape.type}
            draggable
            onDragStart={(e) =>
              onDragStart(e, shape.type, shape.defaultWidth, shape.defaultHeight)
            }
            className="flex h-10 w-10 cursor-grab items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-subtle/80 transition-all duration-150 active:cursor-grabbing hover:scale-105"
            title={`Drag ${shape.label} onto canvas`}
          >
            <shape.icon className="h-5 w-5 stroke-[1.75]" />
          </div>
        ))}
      </div>
    </>
  );
}
