import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Project } from "@/app/generated/prisma/client";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const mapped = userProjects.map((p: Project) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    canvasJsonPath: p.canvasJsonPath,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    isOwned: p.ownerId === userId,
  }));

  return NextResponse.json(mapped);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const id = body.id?.trim() || undefined;
  const name = body.name?.trim() || "Untitled Project";
  const description = body.description?.trim() || null;

  const project = await prisma.project.create({
    data: {
      id,
      ownerId: userId,
      name,
      description,
      status: "DRAFT",
    },
  });

  return NextResponse.json(
    {
      ...project,
      isOwned: true,
    },
    { status: 201 }
  );
}
