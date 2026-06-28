import { NextResponse } from "next/server";
import { put as putToBlobStorage } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { canvasJsonPath: true },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    if (!project.canvasJsonPath) {
      return NextResponse.json({ nodes: [], edges: [] });
    }

    const response = await fetch(project.canvasJsonPath, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
    });
    if (!response.ok) {
      return new NextResponse("Failed to fetch canvas data", { status: 500 });
    }

    const canvasData = await response.json();
    return NextResponse.json(canvasData);
  } catch (error) {
    console.error("[CANVAS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = await params;
    const body = await request.json();

    const blob = await putToBlobStorage(`projects/${projectId}/canvas.json`, JSON.stringify(body), {
      access: "private",
      addRandomSuffix: true,
      contentType: "application/json",
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: blob.url },
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[CANVAS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
