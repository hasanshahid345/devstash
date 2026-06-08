# Current Feature: User Authentication

## Status

In Progress

## Goals

- Install the latest NextAuth/Auth.js packages needed for the app.
- Add the NextAuth Prisma models: Account, Session, and VerificationToken.
- Configure NextAuth v5 with the Prisma adapter using the split auth config pattern.
- Add GitHub OAuth sign-in.
- Add email/password credentials sign-in.
- Create a register page with name, email, password, and confirm password fields.
- Create a sign-in page with an email/password form and GitHub sign-in button.
- Hash user passwords with bcryptjs during registration.
- Protect dashboard routes with edge-compatible middleware/proxy behavior.
- Redirect unauthenticated users to the sign-in page.
- Show the signed-in user's avatar and name in the top bar.
- Add a sign-out link in an avatar dropdown.
- Use the GitHub avatar when available, otherwise show initials.

## Notes

- Spec loaded from `context/features/next-auth-master-spec.md`.
- Check current NextAuth/Auth.js, Prisma 7, and Next.js 16 documentation before implementation.
- Always use Prisma migrations, never `db push`.
- Migration command from spec: `npx prisma migrate dev --name add-auth-models`.
- Use the split auth config pattern for Edge compatibility:
  - `src/lib/auth.config.ts`: base config with providers, JWT session, callbacks, and no Prisma imports. Credentials provider should use an `authorize: () => null` placeholder.
  - `src/lib/auth.ts`: extends `auth.config`, adds `PrismaAdapter`, and overrides Credentials with real bcrypt validation.
  - `src/proxy.ts`: edge-compatible route protection. Only import from `auth.config.ts` and export `NextAuth(authConfig).auth`.
- References from spec:
  - Edge compatibility: https://authjs.dev/getting-started/installation#edge-compatibility
  - Prisma adapter: https://authjs.dev/getting-started/adapters/prisma

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
- 2026-06-07: Add Pro Badge To Sidebar completed with subtle `PRO` badges for file and image sidebar item types. Verified `/dashboard`, `npm run lint`, and `npm run build`.
