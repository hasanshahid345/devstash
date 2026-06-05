# Current Feature

## Stats & Sidebar Data

## Status

Completed

## Goals

- Replace the stats in the dashboard main area with database-backed data
- Show system item types in the sidebar from the database
- Link sidebar item types to `/items/[typename]`
- Show actual collection data in the sidebar from the database
- Add a "View all collections" link under the sidebar collections list that goes to `/collections`
- Keep favorite collection star icons
- For recent collections, show a colored circle based on the most-used item type in that collection
- Create or update `src/lib/db/items.ts` with needed database helpers, using `src/lib/db/collections.ts` as a reference
- Keep the current dashboard design and layout intact

## Notes

- Stats should come from Prisma/database data instead of `src/lib/mock-data.ts`
- Use `src/lib/db/collections.ts` as the implementation reference where helpful
- Preserve the current dashboard styling and spacing as much as possible

## History

- 2026-06-03: Initial Next.js and Tailwind setup completed and committed as `c486aee` (`intial next.js and tailwind setup`).
- 2026-06-03: Dashboard UI Phase 1 completed on branch `feature/dashboard-phase-1`.
- 2026-06-04: Dashboard UI Phase 1 merged to `main` as commit `294fd34` (`feat: build dashboard phase 1 shell`).
- 2026-06-04: Dashboard UI Phase 2 completed with collapsible sidebar, mobile drawer behavior, and `/items` and `/collections` route scaffolding. Build passed with `cmd /c npm run build`.
- 2026-06-04: Dashboard UI Phase 2 marked complete and active feature context cleared.
- 2026-06-04: Dashboard UI Phase 3 started.
- 2026-06-04: Dashboard UI Phase 3 completed with stats cards, recent collections, pinned items, and 10 recent items. Build passed with `cmd /c npm run build`.
- 2026-06-04: SSR-first dashboard refactor started.
- 2026-06-04: Prisma + Neon PostgreSQL setup started.
- 2026-06-05: Seed data setup started from `context/seed-spec.md`.
- 2026-06-05: Seed data setup completed with `npm run db:seed` and verified with `npm run build`.
- 2026-06-05: Dashboard collections data work started from `context/features/dashboard-collections-spec.md`.
- 2026-06-05: Dashboard collections data work completed with Prisma-backed collections and verified with `npm run build`.
- 2026-06-05: Dashboard items data work started from `context/features/dashboard-items-spec.md`.
- 2026-06-05: Dashboard items data work completed with Prisma-backed items and verified with `npm run build`.
- 2026-06-05: Stats & sidebar data work started from `context/features/stats-sidebar-spec.md`.
- 2026-06-05: Stats & sidebar data work completed with Prisma-backed stats and sidebar data. Verified `/dashboard`, `npm run lint`, and `npm run build`.
