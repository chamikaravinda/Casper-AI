"use client";

import { useEffect, useCallback } from "react";
import type { ReactFlowInstance } from "@xyflow/react";

interface UseKeyboardShortcutsOptions {
  flowInstance: ReactFlowInstance | null;
  onUndo: () => void;
  onRedo: () => void;
}

/**
 * Listens for keyboard shortcuts on `window` and delegates to the appropriate
 * canvas actions. Skips all shortcuts when the user is typing inside an
 * interactive element (input, textarea, select, or a contenteditable field).
 */
export function useKeyboardShortcuts({
  flowInstance,
  onUndo,
  onRedo,
}: UseKeyboardShortcutsOptions): void {
  const isTyping = useCallback((target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if (target.isContentEditable) return true;
    return false;
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Zoom in: + or =
      if (!ctrl && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        flowInstance?.zoomIn({ duration: 250 });
        return;
      }

      // Zoom out: -
      if (!ctrl && e.key === "-") {
        e.preventDefault();
        flowInstance?.zoomOut({ duration: 250 });
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z  or  Ctrl/Cmd + Y
      if (ctrl && e.shiftKey && e.key === "z") {
        e.preventDefault();
        onRedo();
        return;
      }
      if (ctrl && !e.shiftKey && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        onRedo();
        return;
      }

      // Undo: Ctrl/Cmd + Z
      if (ctrl && !e.shiftKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        onUndo();
        return;
      }
    },
    [flowInstance, isTyping, onUndo, onRedo]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
