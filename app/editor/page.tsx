import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { EditorClient } from "./editor-client";
import { Project } from "@/app/generated/prisma/client";

export default async function EditorPage() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const emails = user?.emailAddresses?.map((e) => e.emailAddress) || [];

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
    <EditorClient initialProjects={mappedProjects} activeProjectId={null} />
  );
}
