import { useState, useEffect, useRef } from "react";
import { Node, Edge } from "@xyflow/react";

export type SaveStatus = "saving" | "saved" | "error" | "idle";

export function useCanvasAutosave(
  projectId: string,
  nodes: Node[],
  edges: Edge[],
  delayMs: number = 2000
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip saving on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Skip saving if there are no nodes/edges and we haven't modified them
    // (We assume empty canvas is just an empty state we don't necessarily need to autosave immediately)
    // We will save it if the user deleted everything.
    
    setStatus("saving");

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nodes, edges }),
        });

        if (!response.ok) {
          throw new Error("Failed to save canvas");
        }

        setStatus("saved");
      } catch (error) {
        console.error("Autosave failed:", error);
        setStatus("error");
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [projectId, nodes, edges, delayMs]);

  return { status };
}
