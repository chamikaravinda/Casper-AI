"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from "@xyflow/react";
import { CanvasNode, NODE_COLORS, NodeShape } from "@/types/canvas";

// ─── Minimum node dimensions ─────────────────────────────────────────────────

const MIN_WIDTH = 60;
const MIN_HEIGHT = 40;

// ─── Color toolbar ───────────────────────────────────────────────────────────
// Floats above the node when selected; lets users pick from NODE_COLORS pairs.

interface ColorToolbarProps {
  nodeId: string;
  activeFill: string;
}

function ColorToolbar({ nodeId, activeFill }: ColorToolbarProps) {
  const { updateNodeData } = useReactFlow();

  const handleColorSelect = useCallback(
    (e: React.MouseEvent, fill: string, text: string) => {
      e.stopPropagation();
      updateNodeData(nodeId, { color: fill, textColor: text });
    },
    [nodeId, updateNodeData]
  );

  return (
    <div
      // Position slightly above the node; centered horizontally
      className="nodrag nopan absolute left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 rounded-full border border-border-subtle bg-bg-elevated/95 backdrop-blur-md shadow-xl"
      style={{ bottom: "calc(100% + 10px)", zIndex: 50 }}
      // Prevent any pointer event from bubbling to the node/canvas layer
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {NODE_COLORS.map((pair) => {
        const isActive = pair.fill === activeFill;
        return (
          <button
            key={pair.fill}
            title={pair.name}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => handleColorSelect(e, pair.fill, pair.text)}
            className="relative flex-shrink-0 rounded-full transition-transform duration-100 hover:scale-110 focus:outline-none"
            style={{
              width: 18,
              height: 18,
              backgroundColor: pair.fill,
              // Active: vivid ring in text color; inactive: subtle dark ring
              boxShadow: isActive
                ? `0 0 0 2px ${pair.text}, 0 0 6px 1px ${pair.text}60`
                : "0 0 0 1.5px rgba(255,255,255,0.10)",
            }}
            // Inline hover glow via onMouseEnter/Leave (tight, controlled)
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  `0 0 0 1.5px ${pair.text}90, 0 0 5px 1px ${pair.text}40`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 0 1.5px rgba(255,255,255,0.10)";
              }
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Shared label / editing layer ───────────────────────────────────────────

interface LabelLayerProps {
  nodeId: string;
  label: string;
  color: string;
  paddingX?: string;
  fontSize?: string;
}

function LabelLayer({ nodeId, label, color, paddingX = "px-3", fontSize = "text-sm" }: LabelLayerProps) {
  const { updateNodeData } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(label);
  }, [label, editing]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [editing]);

  const commitEdit = useCallback(() => {
    const trimmed = draft.trim();
    updateNodeData(nodeId, { label: trimmed });
    setEditing(false);
  }, [draft, nodeId, updateNodeData]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDraft(label);
    setEditing(true);
  }, [label]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setDraft(label);
      setEditing(false);
    }
  }, [label]);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      onDoubleClick={handleDoubleClick}
    >
      {editing ? (
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className={`noDrag noPan nodrag nopan absolute inset-0 w-full h-full resize-none bg-transparent outline-none border-none ${fontSize} font-medium text-center leading-snug`}
          style={{
            color,
            caretColor: color,
            padding: "8px 12px",
            overflowY: "auto",
          }}
          spellCheck={false}
        />
      ) : (
        <span
          className={`${fontSize} font-medium select-none truncate ${paddingX} text-center w-full`}
          style={{ color }}
        >
          {label || <span style={{ opacity: 0.35 }}>Label</span>}
        </span>
      )}
    </div>
  );
}

// ─── CSS-based shape renderers ──────────────────────────────────────────────

interface CssShapeProps {
  fill: string;
  border: string;
  nodeId: string;
  label: string;
  style?: React.CSSProperties;
  paddingX?: string;
  fontSize?: string;
}

function RectangleShape({ fill, border, nodeId, label }: CssShapeProps) {
  return (
    <div
      className="h-full w-full relative flex items-center justify-center rounded-xl border transition-all"
      style={{ backgroundColor: fill, borderColor: border }}
    >
      <LabelLayer nodeId={nodeId} label={label} color={border} paddingX="px-3" fontSize="text-sm" />
    </div>
  );
}

function PillShape({ fill, border, nodeId, label }: CssShapeProps) {
  return (
    <div
      className="h-full w-full relative flex items-center justify-center border transition-all"
      style={{ backgroundColor: fill, borderColor: border, borderRadius: "9999px" }}
    >
      <LabelLayer nodeId={nodeId} label={label} color={border} paddingX="px-4" fontSize="text-sm" />
    </div>
  );
}

function CircleShape({ fill, border, nodeId, label }: CssShapeProps) {
  return (
    <div
      className="h-full w-full relative flex items-center justify-center border transition-all"
      style={{ backgroundColor: fill, borderColor: border, borderRadius: "50%" }}
    >
      <LabelLayer nodeId={nodeId} label={label} color={border} paddingX="px-2" fontSize="text-xs" />
    </div>
  );
}

// ─── SVG-based shape renderers ───────────────────────────────────────────────

interface SvgShapeProps {
  fill: string;
  border: string;
  nodeId: string;
  label: string;
  width: number;
  height: number;
}

function DiamondShape({ fill, border, nodeId, label, width, height }: SvgShapeProps) {
  const cx = width / 2;
  const cy = height / 2;
  const points = `${cx},2 ${width - 2},${cy} ${cx},${height - 2} 2,${cy}`;

  return (
    <div className="relative h-full w-full">
      <svg width={width} height={height} className="absolute inset-0" style={{ overflow: "visible" }}>
        <polygon points={points} fill={fill} stroke={border} strokeWidth={1.5} />
      </svg>
      <LabelLayer nodeId={nodeId} label={label} color={border} paddingX="px-6" fontSize="text-xs" />
    </div>
  );
}

function HexagonShape({ fill, border, nodeId, label, width, height }: SvgShapeProps) {
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
    <div className="relative h-full w-full">
      <svg width={width} height={height} className="absolute inset-0" style={{ overflow: "visible" }}>
        <polygon points={points} fill={fill} stroke={border} strokeWidth={1.5} />
      </svg>
      <LabelLayer nodeId={nodeId} label={label} color={border} paddingX="px-6" fontSize="text-xs" />
    </div>
  );
}

function CylinderShape({ fill, border, nodeId, label, width, height }: SvgShapeProps) {
  const rx = width / 2 - 2;
  const ry = Math.max(12, height * 0.12);
  const cx = width / 2;
  const bodyTop = ry;
  const bodyBottom = height - ry;

  return (
    <div className="relative h-full w-full">
      <svg width={width} height={height} className="absolute inset-0" style={{ overflow: "visible" }}>
        <rect
          x={cx - rx}
          y={bodyTop}
          width={rx * 2}
          height={bodyBottom - bodyTop}
          fill={fill}
          stroke={border}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <ellipse cx={cx} cy={bodyBottom} rx={rx} ry={ry} fill={fill} stroke={border} strokeWidth={1.5} />
        <ellipse cx={cx} cy={bodyTop} rx={rx} ry={ry} fill={fill} stroke={border} strokeWidth={1.5} />
      </svg>
      <LabelLayer nodeId={nodeId} label={label} color={border} paddingX="px-4" fontSize="text-xs" />
    </div>
  );
}

// ─── Main node component ─────────────────────────────────────────────────────

export function CustomCanvasNode({
  id,
  data,
  isConnectable,
  selected,
  width,
  height,
}: NodeProps<CanvasNode>) {
  // Resolve active color pair — textColor field (set by toolbar) takes priority,
  // otherwise fall back to the palette match on fill, then the default.
  const activeFill = (data.color as string) || NODE_COLORS[0].fill;
  const colorPair = NODE_COLORS.find((c) => c.fill === activeFill) || NODE_COLORS[0];
  const fill = colorPair.fill;

  // Use explicitly stored textColor if available (set by toolbar), else palette text
  const paletteText = (data.textColor as string) || colorPair.text;

  // Subtle border at rest, vivid when selected
  const borderColor = selected ? paletteText : `${paletteText}55`;

  const shape: NodeShape = (data.shape as NodeShape) || "rectangle";
  const label = (data.label as string) || "";

  const nodeWidth = width ?? 150;
  const nodeHeight = height ?? 80;

  const renderShape = () => {
    switch (shape) {
      case "rectangle":
        return <RectangleShape fill={fill} border={borderColor} nodeId={id} label={label} />;
      case "pill":
        return <PillShape fill={fill} border={borderColor} nodeId={id} label={label} />;
      case "circle":
        return <CircleShape fill={fill} border={borderColor} nodeId={id} label={label} />;
      case "diamond":
        return <DiamondShape fill={fill} border={borderColor} nodeId={id} label={label} width={nodeWidth} height={nodeHeight} />;
      case "hexagon":
        return <HexagonShape fill={fill} border={borderColor} nodeId={id} label={label} width={nodeWidth} height={nodeHeight} />;
      case "cylinder":
        return <CylinderShape fill={fill} border={borderColor} nodeId={id} label={label} width={nodeWidth} height={nodeHeight} />;
      default:
        return <RectangleShape fill={fill} border={borderColor} nodeId={id} label={label} />;
    }
  };

  return (
    <div className="group relative h-full w-full">
      {/* Resize handles — only shown when selected */}
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 2,
          backgroundColor: "#ffffff",
          border: "1px solid rgba(255,255,255,0.4)",
          opacity: 0.85,
        }}
        lineStyle={{
          borderColor: `${paletteText}80`,
          borderWidth: 1,
          borderStyle: "dashed",
        }}
      />

      {/* Color toolbar — floats above node when selected */}
      {selected && <ColorToolbar nodeId={id} activeFill={activeFill} />}

      {renderShape()}

      {/* Connection handles — hidden by default, revealed on hover */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        isConnectable={isConnectable}
        className="!w-2 !h-2 !bg-white !border !border-border-default !rounded-full !opacity-0 group-hover:!opacity-100 !transition-opacity !absolute"
        style={{ top: "-4px" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        className="!w-2 !h-2 !bg-white !border !border-border-default !rounded-full !opacity-0 group-hover:!opacity-100 !transition-opacity !absolute"
        style={{ right: "-4px" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={isConnectable}
        className="!w-2 !h-2 !bg-white !border !border-border-default !rounded-full !opacity-0 group-hover:!opacity-100 !transition-opacity !absolute"
        style={{ bottom: "-4px" }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        className="!w-2 !h-2 !bg-white !border !border-border-default !rounded-full !opacity-0 group-hover:!opacity-100 !transition-opacity !absolute"
        style={{ left: "-4px" }}
      />
    </div>
  );
}
