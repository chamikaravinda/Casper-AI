"use client";

import React from "react";
import { Square, Diamond, Circle, Pill, Cylinder, Hexagon } from "lucide-react";

// Configured defaults for shapes
const SHAPES_CONFIG = [
  {
    type: "rectangle",
    icon: Square,
    label: "Rectangle",
    defaultWidth: 150,
    defaultHeight: 80,
  },
  {
    type: "diamond",
    icon: Diamond,
    label: "Diamond",
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    type: "circle",
    icon: Circle,
    label: "Circle",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    type: "pill",
    icon: Pill,
    label: "Pill",
    defaultWidth: 120,
    defaultHeight: 60,
  },
  {
    type: "cylinder",
    icon: Cylinder,
    label: "Cylinder",
    defaultWidth: 100,
    defaultHeight: 120,
  },
  {
    type: "hexagon",
    icon: Hexagon,
    label: "Hexagon",
    defaultWidth: 110,
    defaultHeight: 100,
  },
] as const;

export function ShapePanel() {
  const onDragStart = (
    event: React.DragEvent,
    shapeType: string,
    width: number,
    height: number
  ) => {
    const payload = { shape: shapeType, width, height };
    event.dataTransfer.setData("application/reactflow", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
  };

  return (
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
  );
}
