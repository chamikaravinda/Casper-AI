"use client";

import { useRef, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  ConnectionMode,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { CustomCanvasNode } from "./custom-node";
import { ShapePanel } from "./shape-panel";

import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

// Counter for generating unique node IDs
let nodeCounter = 0;

function FlowCanvas() {
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

  const { setNodes, screenToFlowPosition } = useReactFlow();

  // Register custom node renderers
  const nodeTypes = useMemo(
    () => ({
      canvasNode: CustomCanvasNode,
    }),
    []
  );

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
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
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
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

      {/* Floating bottom shape panel */}
      <ShapePanel />
    </div>
  );
}

export function CollaborativeCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
