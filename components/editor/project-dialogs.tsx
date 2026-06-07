"use client";

import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Project, DialogType } from "@/hooks/use-project-dialogs";
import { Loader2 } from "lucide-react";

interface ProjectDialogsProps {
  dialogType: DialogType;
  activeProject: Project | null;
  name: string;
  slug: string;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onNameChange: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProjectDialogs({
  dialogType,
  activeProject,
  name,
  slug,
  isLoading,
  error,
  onClose,
  onNameChange,
  onSubmit,
}: ProjectDialogsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when rename dialog opens
  useEffect(() => {
    if (dialogType === "rename" && inputRef.current) {
      // Small timeout to ensure dialog has fully rendered and popped in
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [dialogType]);

  const isOpen = dialogType !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-bg-elevated border border-border-default rounded-3xl p-6 shadow-2xl">
        {dialogType === "create" && (
          <form onSubmit={onSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-text-primary">
                Create Project
              </DialogTitle>
              <DialogDescription className="text-sm text-text-muted">
                Create a new collaborative architecture design workspace.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label
                  htmlFor="create-project-name"
                  className="text-xs font-medium text-text-secondary"
                >
                  Project Name
                </label>
                <Input
                  id="create-project-name"
                  placeholder="e.g. Payments Gateway"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  disabled={isLoading}
                  autoComplete="off"
                  className="bg-bg-subtle border-border-subtle focus:border-accent-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">
                  Project URL Slug
                </label>
                <div className="flex h-8 w-full items-center rounded-lg border border-border-subtle bg-bg-base/50 px-2.5 py-1 text-sm text-text-muted select-none">
                  <span className="text-text-faint font-mono mr-1">casper-ai/</span>
                  <span className="font-mono text-accent-primary font-medium truncate">
                    {slug || "project-slug"}
                  </span>
                </div>
                <p className="text-[10px] text-text-faint">
                  Slugs are auto-generated from project names to keep URLs clean.
                </p>
              </div>
              
              {error && (
                <p className="text-xs text-state-error font-medium">{error}</p>
              )}
            </div>

            <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t border-border-default pt-4 -mx-6 -mb-6 px-6 bg-bg-surface/50 rounded-b-3xl">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
                className="text-text-secondary hover:text-text-primary hover:bg-bg-subtle"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="bg-accent-primary text-bg-base hover:bg-accent-primary/90 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1.5 h-4.5 w-4.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {dialogType === "rename" && (
          <form onSubmit={onSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-text-primary">
                Rename Project
              </DialogTitle>
              <DialogDescription className="text-sm text-text-muted">
                Change the name of the project. Currently named{" "}
                <span className="font-semibold text-text-primary">
                  &ldquo;{activeProject?.name}&rdquo;
                </span>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label
                  htmlFor="rename-project-name"
                  className="text-xs font-medium text-text-secondary"
                >
                  New Name
                </label>
                <Input
                  ref={inputRef}
                  id="rename-project-name"
                  placeholder="Enter new project name"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  disabled={isLoading}
                  autoComplete="off"
                  className="bg-bg-subtle border-border-subtle focus:border-accent-primary"
                  required
                />
              </div>

              {error && (
                <p className="text-xs text-state-error font-medium">{error}</p>
              )}
            </div>

            <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t border-border-default pt-4 -mx-6 -mb-6 px-6 bg-bg-surface/50 rounded-b-3xl">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
                className="text-text-secondary hover:text-text-primary hover:bg-bg-subtle"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !name.trim() || name.trim() === activeProject?.name}
                className="bg-accent-primary text-bg-base hover:bg-accent-primary/90 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1.5 h-4.5 w-4.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Rename Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {dialogType === "delete" && (
          <form onSubmit={onSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-state-error">
                Delete Project
              </DialogTitle>
              <DialogDescription className="text-sm text-text-muted">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-text-primary">
                  &ldquo;{activeProject?.name}&rdquo;
                </span>? This action is permanent and cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <p className="text-xs text-state-error font-medium">{error}</p>
            )}

            <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t border-border-default pt-4 -mx-6 -mb-6 px-6 bg-bg-surface/50 rounded-b-3xl">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
                className="text-text-secondary hover:text-text-primary hover:bg-bg-subtle"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isLoading}
                className="font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1.5 h-4.5 w-4.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
