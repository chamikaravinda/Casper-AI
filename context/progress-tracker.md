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


## In Progress

- None yet.

## Next Up

- None yet.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Add decisions that affect the system design or data model.

## Session Notes

- Add context needed to resume work in the next session.
