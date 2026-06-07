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

## In Progress

- Project Dialogs & Editor Home: Implementing '/editor' home view, mock project list and actions (create, rename, delete) with dialogs and custom hooks.

## Next Up

- None yet.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Add decisions that affect the system design or data model.

## Session Notes

- Add context needed to resume work in the next session.
