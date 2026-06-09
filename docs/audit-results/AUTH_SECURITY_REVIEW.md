# Auth Security Review

Last audit date: 2026-06-09

## Scope Reviewed

- `AGENTS.md`
- `context/project-overview.md`
- `context/coding-standards.md`
- `context/ai-interaction.md`
- `context/current-feature.md`
- `src/lib/auth.ts`
- `src/lib/auth.config.ts`
- `src/lib/auth-flags.ts`
- `src/lib/current-user.ts`
- `src/actions/auth.ts`
- `src/lib/email-verification.ts`
- `src/lib/password-reset.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/(auth)/**`
- `src/app/verify-email/route.ts`
- `src/app/profile/page.tsx`
- `src/components/auth/**`
- `src/components/profile/profile-account-actions.tsx`
- `src/lib/db/profile.ts`
- `src/proxy.ts`
- `prisma/schema.prisma`
- Relevant local Next.js docs in `node_modules/next/dist/docs/01-app/02-guides/authentication.md` and `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- Current Auth.js credentials-provider documentation for whether credential-flow protections such as password hashing and rate limiting are application-owned.

## Findings

### Critical

None

### High

None

### Medium

#### Missing rate limiting on credential sign-in

- File: `src/actions/auth.ts:79`
- Issue: `signInWithCredentials` accepts repeated email/password attempts and forwards them to Auth.js without any application-level attempt throttling, IP throttling, account cooldown, or lockout.
- Why this is an actual issue: DevStash supports password authentication. Auth.js credentials-provider documentation leaves password encryption and rate limiting to the application-provided credential logic, and this code currently performs password comparison for every validly shaped request. An attacker can repeatedly try passwords for a known account until constrained by infrastructure rather than the application.
- Specific fix: Add a server-side rate limiter before calling `signIn("credentials", ...)`, keyed by a combination of normalized email and request IP where available. Increment counters on failed attempts, enforce a short lockout or exponential backoff, and reset or decay counters after successful authentication.

#### Missing throttling on registration and password-reset email flows

- File: `src/actions/auth.ts:122`
- Issue: `registerWithCredentials` creates accounts and sends verification email without throttling. `requestPasswordReset` at `src/actions/auth.ts:354` and `requestCurrentUserPasswordReset` at `src/actions/auth.ts:225` also create reset tokens and send email without cooldowns or per-recipient limits.
- Why this is an actual issue: These flows can be called repeatedly to consume database rows, bcrypt CPU, and Resend quota, and to send unwanted auth email. Existing mitigations, such as generic user-facing reset messages and one reset token per identifier, do not limit request volume.
- Specific fix: Add server-side throttles for registration and password-reset requests, keyed by request IP and recipient email. For password reset, enforce a per-email cooldown before creating a new token or sending another email. For registration, enforce per-IP signup limits and consider a per-email cooldown after failed verification-email delivery.

### Low

None

## Passed Checks

- Passwords are hashed with bcrypt before storage during registration in `src/actions/auth.ts:157`.
- New passwords are hashed with bcrypt before storage during reset in `src/actions/auth.ts:459`.
- Credential sign-in validates input server-side before lookup in `src/lib/auth.ts:15`.
- Credential sign-in uses bcrypt comparison instead of plaintext password comparison in `src/lib/auth.ts:65`.
- Unverified password users are blocked from credential sign-in when email verification is enabled in `src/lib/auth.ts:61`.
- Protected server-rendered pages call `getCurrentUser()` before fetching user data, including `/profile` in `src/app/profile/page.tsx:43`.
- `getCurrentUser()` requires a valid session and re-loads the user by authenticated session user ID in `src/lib/current-user.ts:28`.
- Profile data queries are scoped to the authenticated user ID in `src/lib/db/profile.ts:56`.
- Profile account actions re-check the session server-side before sending password reset email or deleting the account in `src/actions/auth.ts:226` and `src/actions/auth.ts:287`.
- Account deletion requires confirmation of the authenticated user's email, not a client-provided user ID, in `src/actions/auth.ts:317`.
- Account deletion removes related verification and password-reset tokens and relies on Prisma cascade cleanup for related user-owned records in `src/actions/auth.ts:324` and `prisma/schema.prisma:50`.
- Password reset tokens are generated with cryptographically secure randomness in `src/lib/password-reset.ts:13`.
- Password reset tokens expire after 24 hours and expired tokens are rejected in `src/lib/password-reset.ts:8` and `src/actions/auth.ts:429`.
- Password reset tokens are scoped to reset identifiers with the `password-reset:` prefix before reset logic can use them in `src/lib/password-reset.ts:33`.
- Password reset updates only the user associated with the reset-token identifier in `src/actions/auth.ts:436`.
- Password reset tokens are deleted after successful reset in `src/actions/auth.ts:471`.
- Email verification tokens are generated with cryptographically secure randomness in `src/lib/email-verification.ts:11`.
- Email verification tokens expire after 24 hours and expired tokens are rejected in `src/lib/email-verification.ts:8` and `src/app/verify-email/route.ts:22`.
- Email verification updates only the user whose email matches the token identifier in `src/app/verify-email/route.ts:26`.
- Email verification tokens are deleted after successful verification in `src/app/verify-email/route.ts:55`.
- Public password-reset request responses avoid direct account-existence disclosure in normal success paths by redirecting to the same `reset_sent` state for missing and existing users in `src/actions/auth.ts:380` and `src/actions/auth.ts:407`.
- Password-change controls are only shown for credential users on the profile page, and the server action also rejects users without a password in `src/app/profile/page.tsx:109` and `src/actions/auth.ts:247`.
- The profile route is protected close to the data read, so the missing `/profile` entry in the optimistic `src/proxy.ts` matcher is not a data-access bypass.

## Notes

- Do not include speculative risks.
- No scoped files were unreadable.
