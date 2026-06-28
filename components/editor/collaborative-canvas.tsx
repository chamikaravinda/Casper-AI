"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  ConnectionMode,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { useUndo, useRedo } from "@liveblocks/react";
import { CustomCanvasNode } from "./custom-node";
import { CustomCanvasEdge } from "./custom-edge";
import { ShapePanel } from "./shape-panel";
import { CanvasControls } from "./canvas-controls";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { CanvasTemplate } from "./starter-templates";
import { PresenceAvatars } from "./presence-avatars";
import { LiveCursors } from "./live-cursors";
import { useMyPresence } from "@liveblocks/react";
import { useCanvasAutosave, SaveStatus } from "@/hooks/use-canvas-autosave";

import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

// Counter for generating unique node IDs
let nodeCounter = 0;

// Default options applied to every new edge connection
const DEFAULT_EDGE_OPTIONS = {
  type: "canvasEdge",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "rgba(248, 250, 252, 0.35)",
    width: 16,
    height: 16,
  },
};

interface FlowCanvasProps {
  projectId: string;
  onImportTemplate?: (handler: (template: CanvasTemplate) => void) => void;
  onSaveStatusChange?: (status: SaveStatus) => void;
}

function FlowCanvas({ projectId, onImportTemplate, onSaveStatusChange }: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useLiveblocksFlow({
    suspense: true,
    nodes: {
      initial: [],
    },
    edges: {
      initial: [],
    },
  });

  const flow = useReactFlow();
  const { setNodes, setEdges, screenToFlowPosition, fitView } = flow;

  const undo = useUndo();
  const redo = useRedo();

  const [, updateMyPresence] = useMyPresence();

  // Autosave
  const { status } = useCanvasAutosave(projectId, nodes, edges);
  
  useEffect(() => {
    if (onSaveStatusChange) {
      onSaveStatusChange(status);
    }
  }, [status, onSaveStatusChange]);

  // Initial load
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    // Only load if room is entirely empty
    if (nodes.length === 0 && edges.length === 0) {
      fetch(`/api/projects/${projectId}/canvas`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.nodes && data.nodes.length > 0) {
            setNodes(data.nodes);
            if (data.edges) {
              setEdges(data.edges);
            }
            requestAnimationFrame(() => {
              fitView({ duration: 400, padding: 0.15 });
            });
          }
        })
        .catch((err) => {
          console.error("Failed to load initial canvas state:", err);
        });
    }
  }, [projectId, nodes.length, edges.length, setNodes, setEdges, fitView]);

  // Wire keyboard shortcuts to the canvas instance and Liveblocks history
  useKeyboardShortcuts({ flowInstance: flow, onUndo: undo, onRedo: redo });

  // Expose a stable import handler to the parent via callback ref pattern
  const handleImportTemplate = useCallback(
    (template: CanvasTemplate) => {
      setNodes(template.nodes);
      setEdges(template.edges);
      // Give React Flow one frame to render nodes before fitting
      requestAnimationFrame(() => {
        fitView({ duration: 400, padding: 0.15 });
      });
    },
    [setNodes, setEdges, fitView]
  );

  // Register the handler with the parent when it mounts or changes
  if (onImportTemplate) {
    onImportTemplate(handleImportTemplate);
  }

  // Register custom node renderers
  const nodeTypes = useMemo(
    () => ({
      canvasNode: CustomCanvasNode,
    }),
    []
  );

  // Register custom edge renderers
  const edgeTypes = useMemo(
    () => ({
      canvasEdge: CustomCanvasEdge,
    }),
    []
  );

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!reactFlowWrapper.current) return;
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    updateMyPresence({
      cursor: {
        x: Math.round(e.clientX - bounds.left),
        y: Math.round(e.clientY - bounds.top),
      },
    });
  };

  const handlePointerLeave = () => {
    updateMyPresence({ cursor: null });
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();

    if (!reactFlowWrapper.current) return;

    const dataStr = event.dataTransfer.getData("application/reactflow");
    if (!dataStr) return;

    try {
      const { shape, width, height } = JSON.parse(dataStr);

      // Convert client window screen position to canvas position coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Generate unique ID: shape_timestamp_counter
      nodeCounter += 1;
      const id = `${shape}_${Date.now()}_${nodeCounter}`;

      const newNode = {
        id,
        type: "canvasNode",
        position,
        data: {
          label: "",
          shape,
          color: "#1F1F1F", // default node color
        },
        style: {
          width: `${width}px`,
          height: `${height}px`,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    } catch (err) {
      console.error("Error creating dropped node:", err);
    }
  };

  return (
    <div
      ref={reactFlowWrapper}
      className="h-full w-full relative bg-bg-base animate-fade-in"
      onDragOver={onDragOver}
      onDrop={onDrop}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <PresenceAvatars />
      <LiveCursors />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        fitView
        connectionMode={ConnectionMode.Loose}
      >
        <Background variant={BackgroundVariant.Dots} color="#2a2a30" gap={16} size={1} />
        <MiniMap
          style={{
            backgroundColor: "#111114",
            borderRadius: "12px",
            border: "1px solid #2a2a30",
          }}
          maskColor="rgba(8, 8, 9, 0.7)"
          nodeColor={(node) => (node.data?.color as string) || "#1f1f1f"}
        />
      </ReactFlow>

      {/* Floating bottom-left control bar */}
      <CanvasControls />

      {/* Floating bottom-center shape panel */}
      <ShapePanel />
    </div>
  );
}

interface CollaborativeCanvasProps {
  projectId: string;
  onImportTemplate?: (handler: (template: CanvasTemplate) => void) => void;
  onSaveStatusChange?: (status: SaveStatus) => void;
}

export function CollaborativeCanvas({ projectId, onImportTemplate, onSaveStatusChange }: CollaborativeCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvas projectId={projectId} onImportTemplate={onImportTemplate} onSaveStatusChange={onSaveStatusChange} />
    </ReactFlowProvider>
  );
}
