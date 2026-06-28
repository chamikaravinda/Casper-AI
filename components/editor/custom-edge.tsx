"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  EdgeProps,
  EdgeLabelRenderer,
  BaseEdge,
  getSmoothStepPath,
  useReactFlow,
  Edge,
} from "@xyflow/react";

// ─── Edge colors ─────────────────────────────────────────────────────────────

const COLOR_REST = "rgba(248, 250, 252, 0.35)"; // dimmed at rest
const COLOR_ACTIVE = "rgba(248, 250, 252, 0.90)"; // brighter on hover / selection

// ─── Custom canvas edge ───────────────────────────────────────────────────────

export function CustomCanvasEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
  markerStart,
  data,
}: EdgeProps<Edge<{ label?: string }>>) {
  const { updateEdgeData } = useReactFlow();
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState((data?.label as string) ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep draft in sync with external label changes (collaborative updates)
  const externalLabel = (data?.label as string) ?? "";
  useEffect(() => {
    if (!editing) setDraft(externalLabel);
  }, [externalLabel, editing]);

  // Focus the input when editing starts
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Compute smooth-step path — gives us the path string + label midpoint coords
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 6,
  });

  const isActive = hovered || selected;
  const strokeColor = isActive ? COLOR_ACTIVE : COLOR_REST;

  const commitEdit = useCallback(() => {
    updateEdgeData(id, { label: draft.trim() });
    setEditing(false);
  }, [draft, id, updateEdgeData]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "Escape") {
        if (e.key === "Escape") setDraft(externalLabel); // discard
        commitEdit();
      }
    },
    [commitEdit, externalLabel]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setDraft(externalLabel);
      setEditing(true);
    },
    [externalLabel]
  );

  const savedLabel = externalLabel.trim();

  return (
    <>
      {/* Invisible wide path for easy hover/click — sits under the visible path */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: "pointer" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={handleDoubleClick}
      />

      {/* Visible edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        interactionWidth={0} // interaction handled by the transparent path above
        style={{
          stroke: strokeColor,
          strokeWidth: 1.5,
          strokeLinecap: "round",
          transition: "stroke 150ms ease",
          pointerEvents: "none",
        }}
      />

      {/* Label rendered via EdgeLabelRenderer so it sits in the correct DOM layer */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
          onDoubleClick={handleDoubleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {editing ? (
            // Auto-sizing input: grows with content
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="nodrag nopan"
              style={{
                // Width grows with content using a hidden span trick via CSS ch units
                // Min 4ch so it's always clickable, grows up to 32ch
                minWidth: "4ch",
                width: `${Math.max(4, Math.min(32, draft.length + 2))}ch`,
                background: "rgba(17, 17, 20, 0.95)",
                border: "1px solid rgba(248, 250, 252, 0.3)",
                borderRadius: "6px",
                color: "#f0f0f4",
                fontSize: "11px",
                fontFamily: "inherit",
                fontWeight: 500,
                padding: "2px 8px",
                outline: "none",
                caretColor: "#00c8d4",
                textAlign: "center",
                backdropFilter: "blur(4px)",
              }}
              spellCheck={false}
            />
          ) : savedLabel ? (
            // Saved label shown as a pill badge
            <div
              style={{
                background: "rgba(17, 17, 20, 0.90)",
                border: `1px solid ${isActive ? "rgba(248,250,252,0.25)" : "rgba(248,250,252,0.12)"}`,
                borderRadius: "9999px",
                color: isActive ? "#f0f0f4" : "#c0c0cc",
                fontSize: "11px",
                fontWeight: 500,
                padding: "2px 10px",
                whiteSpace: "nowrap",
                backdropFilter: "blur(4px)",
                transition: "border-color 150ms ease, color 150ms ease",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {savedLabel}
            </div>
          ) : isActive ? (
            // Faint hint when active with no label
            <div
              style={{
                color: "rgba(248, 250, 252, 0.30)",
                fontSize: "11px",
                fontWeight: 400,
                padding: "2px 8px",
                cursor: "pointer",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              double-click to label
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
