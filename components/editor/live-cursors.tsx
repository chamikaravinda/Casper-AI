"use client";

import { useOthers } from "@liveblocks/react";
import { memo } from "react";

export function LiveCursors() {
  const others = useOthers();

  if (!others) return null;

  return (
    <>
      {others.map(({ connectionId, presence, info }) => {
        if (!presence || !presence.cursor) return null;

        const { x, y } = presence.cursor;
        const color = info?.color || "#000000";
        const name = info?.name || "Anonymous";

        return (
          <Cursor
            key={connectionId}
            color={color}
            x={x}
            y={y}
            name={name}
          />
        );
      })}
    </>
  );
}

interface CursorProps {
  color: string;
  x: number;
  y: number;
  name: string;
}

const Cursor = memo(({ color, x, y, name }: CursorProps) => {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-50 transition-transform duration-100 ease-out"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <svg
        className="relative -top-[1px] -left-[1px]"
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={color}
        />
      </svg>
      <div
        className="absolute left-5 top-5 rounded-md px-2 py-0.5 text-xs font-semibold text-white whitespace-nowrap shadow-sm"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  );
});

Cursor.displayName = "Cursor";
