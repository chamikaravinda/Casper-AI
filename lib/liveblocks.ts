import { Liveblocks } from "@liveblocks/node";

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined;
};

// Use dummy placeholder if key is not yet set in environment to prevent build-time crashes.
export const liveblocks =
  globalForLiveblocks.liveblocks ??
  new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY || "sk_placeholder",
  });

if (process.env.NODE_ENV !== "production") {
  globalForLiveblocks.liveblocks = liveblocks;
}

// Fixed palette of 8 colors matching dark theme accent and canvas styling
export const CURSOR_COLORS = [
  "#52A8FF", // Blue
  "#BF7AF0", // Purple
  "#FF990A", // Orange
  "#FF6166", // Red
  "#F75F8F", // Pink
  "#62C073", // Green
  "#0AC7B4", // Teal
  "#00c8d4", // Cyan
];

/**
 * Deterministically maps a user ID (e.g. Clerk user ID) to a consistent color from a fixed palette.
 */
export function getUserColor(userId: string): string {
  if (!userId) return CURSOR_COLORS[0];
  let sum = 0;
  for (let i = 0; i < userId.length; i++) {
    sum += userId.charCodeAt(i);
  }
  return CURSOR_COLORS[sum % CURSOR_COLORS.length];
}
