import { useState, useCallback } from "react";

export interface Project {
  id: string;
  name: string;
  slug: string;
  isOwned: boolean;
}

export type DialogType = "create" | "rename" | "delete" | null;

export function useProjectDialogs() {
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars except spaces/hyphens
      .replace(/[\s_]+/g, "-") // replace spaces/underscores with hyphens
      .replace(/-+/g, "-") // clean up duplicate hyphens
      .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
  };

  const openCreate = useCallback(() => {
    setName("");
    setSlug("");
    setError(null);
    setActiveProject(null);
    setDialogType("create");
  }, []);

  const openRename = useCallback((project: Project) => {
    setName(project.name);
    setSlug(project.slug);
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
    if (isLoading) return; // Prevent closing while in a simulated action
    setDialogType(null);
    setActiveProject(null);
    setName("");
    setSlug("");
    setError(null);
  }, [isLoading]);

  const handleNameChange = useCallback(
    (newName: string) => {
      setName(newName);
      if (dialogType === "create") {
        setSlug(generateSlug(newName));
      }
    },
    [dialogType]
  );

  const startSubmit = useCallback(
    async (onSubmit: () => Promise<void> | void) => {
      if (!name.trim() && dialogType !== "delete") {
        setError("Name is required");
        return;
      }
      setError(null);
      setIsLoading(true);
      try {
        // Simulate a tiny networking delay for a premium feel
        await new Promise((resolve) => setTimeout(resolve, 600));
        await onSubmit();
        setDialogType(null);
        setActiveProject(null);
        setName("");
        setSlug("");
      } catch (err: any) {
        setError(err?.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [name, dialogType]
  );

  return {
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
    setName: handleNameChange,
    startSubmit,
  };
}
