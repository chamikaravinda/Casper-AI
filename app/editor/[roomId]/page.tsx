import { redirect } from "next/navigation";
import { getClerkIdentity, checkProjectAccess } from "@/lib/project-access";
import { AccessDenied } from "@/components/editor/access-denied";
import { EditorClient } from "../editor-client";
import { Project } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;


export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const identity = await getClerkIdentity();
  if (!identity) {
    redirect("/sign-in");
  }

  const { roomId } = await params;
  const { hasAccess, activeProject, userProjects } = await checkProjectAccess(roomId);

  if (!hasAccess || !activeProject) {
    return <AccessDenied />;
  }

  const mappedProjects = userProjects.map((p: Project) => ({
    id: p.id,
    name: p.name,
    isOwned: p.ownerId === identity.userId,
    description: p.description,
    status: p.status,
    canvasJsonPath: p.canvasJsonPath,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    slug: p.id,
  }));

  return (
    <EditorClient initialProjects={mappedProjects} activeProjectId={roomId} />
  );
}
