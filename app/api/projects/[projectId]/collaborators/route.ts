import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  // 1. Fetch project with collaborators
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // 2. Fetch current user emails to check access
  const client = await clerkClient();
  let currentUserEmails: string[] = [];
  try {
    const currentUser = await client.users.getUser(userId);
    currentUserEmails = currentUser.emailAddresses.map((e) => e.emailAddress.toLowerCase()) || [];
  } catch (err) {
    console.error("Error fetching current Clerk user:", err);
  }

  const isOwner = project.ownerId === userId;
  const isCollaborator = project.collaborators.some((c: any) =>
    currentUserEmails.includes(c.email.toLowerCase())
  );

  if (!isOwner && !isCollaborator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Enrich owner details
  let ownerInfo = {
    userId: project.ownerId,
    email: "unknown@example.com",
    name: "Project Owner",
    avatarUrl: "",
  };

  try {
    const ownerUser = await client.users.getUser(project.ownerId);
    ownerInfo = {
      userId: project.ownerId,
      email: ownerUser.emailAddresses[0]?.emailAddress || "unknown@example.com",
      name: `${ownerUser.firstName || ""} ${ownerUser.lastName || ""}`.trim() || "Project Owner",
      avatarUrl: ownerUser.imageUrl || "",
    };
  } catch (err) {
    console.error("Error fetching owner from Clerk:", err);
  }

  // 4. Enrich collaborators details
  const collaboratorEmails = project.collaborators.map((c: any) => c.email);
  
  let clerkUsers: any[] = [];
  if (collaboratorEmails.length > 0) {
    try {
      // Query Clerk for users with these emails
      const clerkUsersResponse = await client.users.getUserList({
        emailAddress: collaboratorEmails,
      });
      clerkUsers = clerkUsersResponse.data || [];
    } catch (err) {
      console.error("Error fetching collaborators from Clerk:", err);
    }
  }

  const enrichedCollaborators = project.collaborators.map((c: any) => {
    const matchedUser = clerkUsers.find((u: any) =>
      u.emailAddresses.some(
        (e: any) => e.emailAddress.toLowerCase() === c.email.toLowerCase()
      )
    );

    return {
      id: c.id,
      email: c.email,
      name: matchedUser
        ? `${matchedUser.firstName || ""} ${matchedUser.lastName || ""}`.trim() || null
        : null,
      avatarUrl: matchedUser ? matchedUser.imageUrl : null,
      createdAt: c.createdAt,
    };
  });

  return NextResponse.json({
    owner: ownerInfo,
    collaborators: enrichedCollaborators,
    isOwned: isOwner,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Server-side check: Only project owner can invite
  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  // Check if trying to invite the owner
  const client = await clerkClient();
  let ownerEmail = "";
  try {
    const ownerUser = await client.users.getUser(project.ownerId);
    ownerEmail = ownerUser.emailAddresses[0]?.emailAddress?.toLowerCase() || "";
  } catch (err) {
    console.error("Error checking owner email:", err);
  }

  if (email === ownerEmail) {
    return NextResponse.json(
      { error: "Cannot invite the project owner" },
      { status: 400 }
    );
  }

  // Add collaborator to DB (handle unique constraint gracefully)
  try {
    const existing = await prisma.projectCollaborator.findUnique({
      where: {
        projectId_email: {
          projectId,
          email,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User is already a collaborator" },
        { status: 400 }
      );
    }

    const collaborator = await prisma.projectCollaborator.create({
      data: {
        projectId,
        email,
      },
    });

    return NextResponse.json(collaborator, { status: 201 });
  } catch (err) {
    console.error("Error creating project collaborator:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Server-side check: Only project owner can remove
  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    await prisma.projectCollaborator.delete({
      where: {
        projectId_email: {
          projectId,
          email,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting project collaborator:", err);
    return NextResponse.json(
      { error: "Collaborator not found or internal error" },
      { status: 400 }
    );
  }
}
