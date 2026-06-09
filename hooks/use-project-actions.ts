import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface Project {
  id: string;
  name: string;
  slug: string;
  isOwned: boolean;
}

export type DialogType = "create" | "rename" | "delete" | null;

export function useProjectActions(activeProjectId: string | null) {
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const openCreate = useCallback(() => {
    setName("");
    setError(null);
    setActiveProject(null);
    setDialogType("create");
  }, []);

  const openRename = useCallback((project: Project) => {
    setName(project.name);
    setError(null);
    setActiveProject(project);
    setDialogType("rename");
  }, []);

  const openDelete = useCallback((project: Project) => {
    setError(null);
    setActiveProject(project);
    setDialogType("delete");
  }, []);

  const close = useCallback(() => {
    if (isLoading) return;
    setDialogType(null);
    setActiveProject(null);
    setName("");
    setError(null);
  }, [isLoading]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isLoading) return;

      if (!name.trim() && dialogType !== "delete") {
        setError("Name is required");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (dialogType === "create") {
          const suffix = Math.random().toString(36).substring(2, 6);
          const roomId = `${generateSlug(name)}-${suffix}`;

          const res = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: roomId,
              name: name.trim(),
            }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to create project");
          }

          const project = await res.json();
          close();
          router.push(`/editor/${project.id}`);
          router.refresh();
        } else if (dialogType === "rename") {
          if (!activeProject) return;

          const res = await fetch(`/api/projects/${activeProject.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name.trim(),
            }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to rename project");
          }

          close();
          router.refresh();
        } else if (dialogType === "delete") {
          if (!activeProject) return;

          const res = await fetch(`/api/projects/${activeProject.id}`, {
            method: "DELETE",
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to delete project");
          }

          close();
          if (activeProjectId === activeProject.id) {
            router.push("/editor");
            router.refresh();
          } else {
            router.refresh();
          }
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [dialogType, name, activeProject, activeProjectId, router, close, isLoading]
  );

  const slugPreview = name.trim() ? `${generateSlug(name)}-xxxx` : "";

  return {
    dialogType,
    activeProject,
    name,
    slug: slugPreview,
    isLoading,
    error,
    openCreate,
    openRename,
    openDelete,
    close,
    setName,
    onSubmit: handleSubmit,
  };
}
