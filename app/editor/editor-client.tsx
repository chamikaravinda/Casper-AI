"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { useProjectActions, Project } from "@/hooks/use-project-actions";
import { useRouter } from "next/navigation";

interface EditorClientProps {
  initialProjects: Project[];
  activeProjectId: string | null;
}

export function EditorClient({
  initialProjects,
  activeProjectId,
}: EditorClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const {
    dialogType,
    activeProject,
    name,
    slug,
    isLoading,
    error,
    openCreate,
    openRename,
    openDelete,
    close,
    setName,
    onSubmit,
  } = useProjectActions(activeProjectId);

  const handleSelectProject = (project: Project | null) => {
    if (project) {
      router.push(`/editor/${project.id}`);
    } else {
      router.push("/editor");
    }
    // On mobile, close sidebar after selecting a project
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const activeProjectData = initialProjects.find((p) => p.id === activeProjectId);

  return (
    <div className="flex h-screen flex-col bg-bg-base overflow-hidden relative">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,200,212,0.04),transparent_55%)]" />

      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          projects={initialProjects}
          activeProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onCreateProjectClick={openCreate}
          onRenameProjectClick={openRename}
          onDeleteProjectClick={openDelete}
        />

        {/* Content Area */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          {activeProjectData ? (
            /* Selected Project Canvas View */
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center z-10">
              <div className="space-y-2 max-w-lg">
                <span className="text-xs uppercase tracking-widest text-accent-primary font-mono bg-accent-primary-dim px-2.5 py-1 rounded-full border border-accent-primary/20">
                  Room: {activeProjectData.slug}
                </span>
                <h2 className="text-2xl font-semibold text-text-primary tracking-tight mt-2">
                  {activeProjectData.name}
                </h2>
                <p className="text-sm text-text-muted">
                  Real-time collaborative canvas will load here. Edit the system components or trigger AI generation.
                </p>
                <div className="pt-4 flex items-center justify-center">
                  <div className="border border-dashed border-border-default rounded-xl p-8 bg-bg-surface/50 text-xs text-text-faint font-mono">
                    [ React Flow + Liveblocks Canvas Placement ]
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Editor Home Screen */
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center z-10">
              <div className="max-w-md space-y-4">
                <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
                  Create a project or open an existing one
                </h1>
                <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
                  Start a new architecture workspace, or choose a project from the sidebar.
                </p>
                <div className="pt-2 flex justify-center">
                  <Button
                    onClick={openCreate}
                    variant="default"
                    size="lg"
                    className="gap-2 bg-accent-primary text-bg-base hover:bg-accent-primary/90 font-medium shadow-lg shadow-accent-primary-dim transition-all hover:scale-[1.02]"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    New Project
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Render Dialog components */}
      <ProjectDialogs
        dialogType={dialogType}
        activeProject={activeProject}
        name={name}
        slug={slug}
        isLoading={isLoading}
        error={error}
        onClose={close}
        onNameChange={setName}
        onSubmit={onSubmit}
      />
    </div>
  );
}
