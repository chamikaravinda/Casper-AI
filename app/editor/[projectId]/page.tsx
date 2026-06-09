import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { EditorClient } from "../editor-client";
import { notFound } from "next/navigation";
import { Project } from "@/app/generated/prisma/client";

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const { projectId } = await params;

  const user = await currentUser();
  const emails = user?.emailAddresses?.map((e) => e.emailAddress) || [];

  // Fetch all user projects to populate the sidebar and verify access
  const userProjects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          collaborators: {
            some: {
              email: { in: emails },
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Verify access permissions to the active workspace project
  const hasAccess = userProjects.some((p: Project) => p.id === projectId);
  if (!hasAccess) {
    notFound();
  }

  const mappedProjects = userProjects.map((p: Project) => ({
    id: p.id,
    name: p.name,
    isOwned: p.ownerId === userId,
    description: p.description,
    status: p.status,
    canvasJsonPath: p.canvasJsonPath,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    slug: p.id,
  }));

  return (
    <EditorClient initialProjects={mappedProjects} activeProjectId={projectId} />
  );
}
