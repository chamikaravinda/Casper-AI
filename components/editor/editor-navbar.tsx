"use client";

import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles, LayoutTemplate, Cloud, Loader2, Check, CloudAlert } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  projectName?: string;
  isAiSidebarOpen?: boolean;
  onToggleAiSidebar?: () => void;
  onShareClick?: () => void;
  onTemplatesClick?: () => void;
  saveStatus?: "saving" | "saved" | "error" | "idle";
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName,
  isAiSidebarOpen = false,
  onToggleAiSidebar,
  onShareClick,
  onTemplatesClick,
  saveStatus = "idle",
}: EditorNavbarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border-default bg-bg-surface px-3">
      {/* Left section — sidebar toggle and project name */}
      <div className="flex items-center min-w-0 gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="hover:bg-bg-subtle text-text-secondary"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
        <div className="h-4 w-[1px] bg-border-default shrink-0" />
        {projectName ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold text-text-primary truncate">
              {projectName}
            </span>
          </div>
        ) : (
          <span className="text-sm font-semibold text-text-primary">
            Casper AI
          </span>
        )}
      </div>

      {/* Center section */}
      <div className="flex items-center" />

      {/* Right section — user controls and workspace actions */}
      <div className="flex items-center gap-2">
        {projectName && (
          <>
            <div className="flex items-center gap-2 mr-2 text-xs text-text-secondary">
              {saveStatus === "saving" && (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  Saved
                </>
              )}
              {saveStatus === "error" && (
                <>
                  <CloudAlert className="h-3.5 w-3.5 text-red-500" />
                  Save Error
                </>
              )}
              {saveStatus === "idle" && (
                <>
                  <Cloud className="h-3.5 w-3.5" />
                  Saved
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onTemplatesClick}
              className="h-8 border-border-default bg-bg-surface hover:bg-bg-subtle hover:text-text-primary text-text-secondary rounded-lg gap-2 text-xs"
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              Templates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onShareClick}
              className="h-8 border-border-default bg-bg-surface hover:bg-bg-subtle hover:text-text-primary text-text-secondary rounded-lg gap-2 text-xs"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleAiSidebar}
              className={`h-8 w-8 hover:bg-bg-subtle rounded-lg text-text-secondary hover:text-text-primary ${
                isAiSidebarOpen ? "bg-bg-subtle text-accent-ai hover:text-accent-ai-text" : ""
              }`}
              aria-label="Toggle AI Assistant"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <div className="h-4 w-[1px] bg-border-default shrink-0 mx-1" />
          </>
        )}
        <UserButton />
      </div>
    </header>
  );
}


