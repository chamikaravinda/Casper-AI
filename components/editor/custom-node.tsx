"use client";

import { Handle, Position, NodeProps } from "@xyflow/react";
import { CanvasNode, NODE_COLORS } from "@/types/canvas";

export function CustomCanvasNode({ data, isConnectable }: NodeProps<CanvasNode>) {
  // Resolve colors matching the node data
  const colorPair = NODE_COLORS.find((c) => c.fill === data.color) || NODE_COLORS[0];
  const borderAndTextColor = colorPair.text;

  return (
    <div
      className="group h-full w-full flex items-center justify-center rounded-xl border p-3 shadow-md relative transition-all"
      style={{
        backgroundColor: data.color || "#1F1F1F",
        borderColor: borderAndTextColor,
        color: borderAndTextColor,
      }}
    >
      <span className="text-sm font-medium truncate select-none px-2 text-center w-full">
        {data.label || "Untitled"}
      </span>

      {/* Connection Handles at all four sides, hidden by default and revealed on hover */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        isConnectable={isConnectable}
        className="w-2 h-2 bg-white border border-border-default rounded-full opacity-0 group-hover:opacity-100 transition-opacity absolute"
        style={{ top: "-4px" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        className="w-2 h-2 bg-white border border-border-default rounded-full opacity-0 group-hover:opacity-100 transition-opacity absolute"
        style={{ right: "-4px" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={isConnectable}
        className="w-2 h-2 bg-white border border-border-default rounded-full opacity-0 group-hover:opacity-100 transition-opacity absolute"
        style={{ bottom: "-4px" }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        className="w-2 h-2 bg-white border border-border-default rounded-full opacity-0 group-hover:opacity-100 transition-opacity absolute"
        style={{ left: "-4px" }}
      />
    </div>
  );
}
