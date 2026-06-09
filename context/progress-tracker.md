# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Editor Chrome — Navbar and Sidebar Shell

## Current Goal

- Build and extend editor-level UI: canvas overlay, AI sidebar, prompt panel, and node interactions.

## Completed

- 01-design-system.md: Added shadcn/ui, Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea, lucide-react, and implemented dark theme.
- 02-editor.md: Created `components/editor/editor-navbar.tsx` (fixed-height top navbar with `PanelLeftOpen`/`PanelLeftClose` toggle, dark bg, subtle bottom border) and `components/editor/project-sidebar.tsx` (floating overlay sidebar, slides in from left, Projects header + close button, My Projects / Shared tabs with empty placeholder states, full-width New Project button at bottom). Zero TypeScript and lint errors.
- 03-auth.md: Implemented Clerk authentication per spec. `ClerkProvider` uses `dark` theme with CSS variable overrides (no hardcoded colors). `proxy.ts` at project root uses env vars (`NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`) for public route matching; all other routes protected. Added explicit Tailwind CSS v4 `@source` rules in `app/globals.css` to scan route groups (`(auth)`) on Windows correctly. Home page (`/`) redirects authenticated users to `/editor` and unauthenticated users to `/sign-in`. `UserButton` in editor navbar right section. `@clerk/nextjs` and `@clerk/ui` installed.
- redesign auth: Redesigned the sign-in and sign-up pages to match the reference photo. Upgraded the two-panel layout in `app/(auth)/layout.tsx` to include "Casper AI" branding, tagline, description, and three rich feature rows with custom teal-dim squircle badges and Lucide React icons. Modified `ClerkProvider` in `app/layout.tsx` to use the `localization` prop for overriding dynamic card header text to "Casper AI" titles and subtitles. Added `appearance.elements` custom Tailwind classes to style card containers (border radius `3xl`), dark inputs, social login buttons, and primary button colors (cyan bg with dark text). Switched from dynamic next/font/google downloads to standard offline variables with system-level font fallbacks to allow production builds to pass in isolated network environments. Checked and compiled production build with zero errors.
- 04-project-dialogs.md: Implemented project dialogs and Editor Home view. Created `hooks/use-project-dialogs.ts` for managing state with live slug generator. Developed the `components/editor/project-dialogs.tsx` component containing Create, Rename (with auto-focus and Enter submission), and Delete confirmation dialogs. Refactored `components/editor/project-sidebar.tsx` to dynamically render project lists, active selections, empty fallbacks, and hover actions (owned only). Wired all inputs and loaders into `app/editor/page.tsx` with premium dark-mode styling and center radial backdrop glow. Validated production build with zero errors.
- 05-prisma.md: Implemented the schema models for Project (owner ID, name, status enum, description, canvasJsonPath, and timestamps) and ProjectCollaborator (unique project/email constraint and cascade deletes) in `prisma/models/project.prisma` using Prisma's multi-file schema feature. Configured `prisma.config.ts` to scan the schema directory. Created a cached Prisma Client singleton in `lib/prisma.ts` that dynamically branches based on the database URL (using `@prisma/extension-accelerate` for `prisma+postgres://` URLs and `@prisma/adapter-pg` with connection pooling for direct PostgreSQL URLs). Generated the client and successfully deployed database migrations with zero TypeScript or build errors.
- 06-project-apis.md: Implemented project API REST endpoints for listing (`GET /api/projects`), creating (`POST /api/projects`), renaming (`PATCH /api/projects/[projectId]`), and deleting (`DELETE /api/projects/[projectId]`) projects. Enforced secure routing: unauthenticated calls return `401`, mutations are owner-restricted (`ownerId === userId`) returning `403` on violation, and dynamically resolved dynamic parameter promises in compliance with Next.js 16 requirements. Verified build with zero TypeScript compiler or Turbopack errors.
- 07-wire-editor-home.md: Wired the editor home interface, dynamic dynamic route project workspaces, and creation/deletion/renaming dialogs to the database API. Converted `app/editor/page.tsx` and created `app/editor/[projectId]/page.tsx` as Server Components that query project data directly using Prisma on load. Refactored the UI states into `app/editor/editor-client.tsx` Client Component. Created `hooks/use-project-actions.ts` to coordinate dialog state, random alphanumeric suffix generation, and fetch queries (POST, PATCH, DELETE), triggering page redirects or refreshes. Removed legacy `hooks/use-project-dialogs.ts` file. Verified build with zero errors.
- 08-editor-workspace-shell.md: Implemented editor workspace shell `/editor/[roomId]` with server-side authentication and access checks. Created `lib/project-access.ts` helper and `components/editor/access-denied.tsx` fallback page. Replaced dynamic route `/editor/[projectId]` with `/editor/[roomId]`. Extended `components/editor/editor-navbar.tsx` to display the project name and provide share/AI assistant toggle buttons. Refactored `app/editor/editor-client.tsx` to handle the split workspace layout with canvas and AI sidebar panels. Successfully compiled production build with zero errors.
- 09-share-dialog.md: Implemented the collaborative Share Dialog feature. Created a new API route `/api/projects/[projectId]/collaborators` supporting GET (listing enriched users via Clerk Backend SDK), POST (inviting users), and DELETE (removing users). Developed the `ShareDialog` component with premium workspace styling, rendering invite controls and collaborator management only for project owners while providing a read-only list for collaborators. Integrated the dialog state into `EditorClient` and connected the navbar Share button. Verified successful Next.js production build and TypeScript compilation.
- 10-liveblocks-setup.md: Configured Liveblocks realtime collaboration infrastructure. Added type declarations for custom `Presence` (cursor, isThinking) and `UserMeta` (id, name, avatar, color) in `liveblocks.config.ts`. Installed `@liveblocks/node@3.19.5`, created a cached Liveblocks server client singleton, and built a deterministic user cursor color generator in `lib/liveblocks.ts`. Developed the authentication route `POST /api/liveblocks-auth` to enforce user auth, verify project access, ensure room existence, and sign token sessions.
- 11-base-canvas.md: Replaced the static canvas placeholder with a Liveblocks-backed React Flow canvas. Created `types/canvas.ts` to define types for `CanvasNode`, `CanvasEdge`, `NodeShape`, and `CanvasNodeData` alongside `NODE_COLORS` and `NODE_SHAPES` arrays. Implemented `CanvasErrorBoundary` to catch socket connection and rendering errors. Built `CanvasWrapper` to configure client-side `LiveblocksProvider` and `RoomProvider` setups. Developed `CollaborativeCanvas` containing React Flow synced via `useLiveblocksFlow`, loose connection mode, fitView, dot background, and custom styled MiniMap. Wired the canvas directly into the main workspace in `app/editor/editor-client.tsx`.
- 12-shape-panel.md: Implemented the bottom shape panel toolbar and node drag-and-drop capabilities. Developed `components/editor/shape-panel.tsx` containing draggable buttons for the six primary canvas shapes (rectangle, diamond, circle, pill, cylinder, hexagon) with default size constraints. Developed the `CustomCanvasNode` component in `components/editor/custom-node.tsx` which renders nodes using the `NODE_COLORS` color system and displays connection handles on hover. Wrapped the canvas in `ReactFlowProvider` inside `components/editor/collaborative-canvas.tsx` to utilize `useReactFlow()` helpers. Configured drop and dragover event targets, coordinates translations, ID generators, and node creation logic. Refactored the AI sidebar in `app/editor/editor-client.tsx` to float overlay matching the `ProjectSidebar` layout. Added detailed authorization response logs in `app/api/liveblocks-auth/route.ts` to diagnose socket connection loading issues.

## In Progress

- None.

## Next Up

- None yet.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Add decisions that affect the system design or data model.

## Session Notes

- Add context needed to resume work in the next session.
