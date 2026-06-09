import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { Project } from "@/app/generated/prisma/client";

export interface ClerkIdentity {
  userId: string;
  emails: string[];
}

export async function getClerkIdentity(): Promise<ClerkIdentity | null> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return null;
    }
    let emails: string[] = [];
    try {
      const user = await currentUser();
      emails = user?.emailAddresses?.map((e) => e.emailAddress) || [];
    } catch (err) {
      console.error("Error fetching current Clerk user details in getClerkIdentity:", err);
    }
    return { userId, emails };
  } catch (err) {
    console.error("General error in getClerkIdentity:", err);
    return null;
  }
}

export interface AccessCheckResult {
  hasAccess: boolean;
  activeProject: Project | null;
  userProjects: Project[];
}

export async function checkProjectAccess(roomId: string): Promise<AccessCheckResult> {
  const identity = await getClerkIdentity();
  if (!identity) {
    return { hasAccess: false, activeProject: null, userProjects: [] };
  }
  const { userId, emails } = identity;

  const cleanRoomId = decodeURIComponent(roomId).trim();

  // 1. Fetch active project directly from database by ID
  let activeProject: any = null;
  try {
    activeProject = await prisma.project.findUnique({
      where: { id: cleanRoomId },
      include: {
        collaborators: true,
      },
    });
  } catch (err) {
    console.error("Error fetching active project by ID:", err);
  }

  // 2. Verify access to this specific project
  let hasAccess = false;
  if (activeProject) {
    const isOwner = activeProject.ownerId === userId;
    const isCollaborator = activeProject.collaborators.some((c: any) =>
      emails.includes(c.email)
    );
    if (isOwner || isCollaborator) {
      hasAccess = true;
    }
  }

  // 3. Fetch all user projects to populate the sidebar and verify access
  let userProjects: Project[] = [];
  try {
    userProjects = await prisma.project.findMany({
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
  } catch (err) {
    console.error("Error fetching user projects list:", err);
  }
  return {
    hasAccess,
    activeProject,
    userProjects,
  };
}
