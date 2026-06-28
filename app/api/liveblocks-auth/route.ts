import { auth, currentUser } from "@clerk/nextjs/server";
import { checkProjectAccess } from "@/lib/project-access";
import { liveblocks, getUserColor } from "@/lib/liveblocks";

export async function POST(request: Request) {
  // 1. Require Clerk authentication
  const { userId } = await auth();
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Parse project/room ID from request body
  let room: string;
  try {
    const body = await request.json();
    room = body.room;
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!room) {
    return new Response(
      JSON.stringify({ error: "Room ID is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. Verify project access using the existing access helper
  const { hasAccess, activeProject } = await checkProjectAccess(room);
  if (!hasAccess || !activeProject) {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. Ensure the Liveblocks room exists (create only if needed)
  try {
    await liveblocks.getOrCreateRoom(room, {
      defaultAccesses: [], // Rooms are private by default; we delegate access via tokens
    });
  } catch (error) {
    console.error(`Error ensuring room ${room} exists:`, error);
    // Note: We don't fail the request if the room exists check fails, as
    // authorization tokens can still be generated and the room will be created on connect if needed
  }

  // 4. Return a session token with user info
  const user = await currentUser();
  if (!user) {
    return new Response(
      JSON.stringify({ error: "User details not found" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || `User_${user.id.slice(-6)}`;
  const avatarUrl = user.imageUrl;
  const cursorColor = getUserColor(userId);

  // Initialize access token session
  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: displayName,
      avatar: avatarUrl,
      color: cursorColor,
    },
  });

  // Grant user write/read accesses to this room
  session.allow(room, session.FULL_ACCESS);

  // Authorize and return token
  try {
    const { status, body: responseBody } = await session.authorize();
    console.log(`Liveblocks auth response: status = ${status}, response =`, responseBody);
    return new Response(responseBody, { status });
  } catch (error) {
    console.error(`Liveblocks authorization error for room ${room}:`, error);
    return new Response(
      JSON.stringify({ error: "Internal authorization failure", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
