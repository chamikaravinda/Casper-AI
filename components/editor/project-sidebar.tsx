"use client";

import { Folder, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Project } from "@/hooks/use-project-dialogs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (project: Project | null) => void;
  onCreateProjectClick: () => void;
  onRenameProjectClick: (project: Project) => void;
  onDeleteProjectClick: (project: Project) => void;
}

export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProjectClick,
  onRenameProjectClick,
  onDeleteProjectClick,
}: ProjectSidebarProps) {
  const ownedProjects = projects.filter((p) => p.isOwned);
  const sharedProjects = projects.filter((p) => !p.isOwned);

  const renderProjectList = (list: Project[]) => {
    return (
      <ScrollArea className="h-[calc(100vh-14.5rem)] pr-2">
        <div className="space-y-1.5 py-1">
          {list.map((project) => {
            const isActive = project.id === activeProjectId;
            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-all duration-150 cursor-pointer select-none",
                  isActive
                    ? "bg-bg-subtle text-text-primary border border-border-default/50"
                    : "text-text-secondary hover:bg-bg-subtle/50 hover:text-text-primary border border-transparent"
                )}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Folder
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-accent-primary"
                        : "text-text-muted group-hover:text-text-secondary"
                    )}
                  />
                  <span className="truncate font-medium">{project.name}</span>
                </div>

                {project.isOwned && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity ml-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRenameProjectClick(project);
                      }}
                      title="Rename project"
                      className="text-text-muted hover:text-text-primary hover:bg-bg-elevated"
                    >
                      <Pencil className="h-3 w-3" />
                      <span className="sr-only">Rename</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProjectClick(project);
                      }}
                      title="Delete project"
                      className="text-text-muted hover:text-state-error hover:bg-bg-elevated"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-bg-base/70 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {/* Floating sidebar — does not push page content */}
      <aside
        className={cn(
          "fixed inset-y-3 left-3 top-[3.75rem] z-50 flex w-72 flex-col rounded-2xl border border-border-subtle bg-bg-surface/95 backdrop-blur-xl transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"
        )}
      >
        {/* Header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border-default px-4">
          <span className="text-sm font-medium text-text-primary">Projects</span>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-1 flex-col overflow-hidden p-3">
          <Tabs defaultValue="my-projects" className="flex flex-1 flex-col">
            <TabsList className="w-full">
              <TabsTrigger value="my-projects" className="flex-1">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="shared" className="flex-1">
                Shared
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-projects" className="flex-1 pt-4 overflow-hidden">
              {ownedProjects.length > 0 ? (
                renderProjectList(ownedProjects)
              ) : (
                /* Empty placeholder state */
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center px-4">
                  <p className="text-sm text-text-muted">No projects yet.</p>
                  <p className="text-xs text-text-faint">
                    Create a project to get started.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="shared" className="flex-1 pt-4 overflow-hidden">
              {sharedProjects.length > 0 ? (
                renderProjectList(sharedProjects)
              ) : (
                /* Empty placeholder state */
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center px-4">
                  <p className="text-sm text-text-muted">No shared projects.</p>
                  <p className="text-xs text-text-faint">
                    Projects shared with you will appear here.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer — full-width New Project button */}
        <div className="shrink-0 p-3 border-t border-border-default">
          <Button
            variant="default"
            size="default"
            className="w-full gap-2 bg-accent-primary text-bg-base hover:bg-accent-primary/90 font-medium"
            onClick={onCreateProjectClick}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
