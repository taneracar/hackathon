# 0001. Add Better Auth authentication to the NestJS backend

**Date**: 2026-07-14
**Status**: Accepted

## Summary

This adds sign up and sign in (email and password) to the backend using Better Auth, wired into NestJS through the community package `@thallesp/nestjs-better-auth`. Every user gets a role, either `PARTICIPANT` or `ADMIN`, defaulting to `PARTICIPANT`, and a signer cannot set their own role. Once this is built, every route in the app is authenticated by default unless a route is explicitly marked public.

## Context

The backend has no authentication yet. It already runs NestJS 11 on the Express adapter, with Prisma (Postgres, through the `pg` adapter) as the only database layer and Arcjet as a global guard for bot detection, shield, and rate limiting. `.env` already has `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `DATABASE_URL` placeholders, and the Prisma schema has no models yet, only the generator and datasource blocks. The engineer named the library and the integration path directly (the official `@thallesp/nestjs-better-auth` NestJS guide), and asked for a two value role on the user, set by the server only, never by the person signing up. This spec records that decision and the small set of choices it still leaves open (session storage, plugins, where the config file lives) so the build has one clear contract to follow.

## Requirements

**User stories**:
- As a visitor, I want to sign up with an email, password, and name so that I get an account and an active session.
- As a returning user, I want to sign in with my email and password so that I get a new active session.
- As the system, I want every new account to start as `PARTICIPANT` so that nobody can grant themselves elevated access at signup.
- As a route owner, I want every route protected by default so that a new endpoint is never accidentally left open.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):
- **AC-1**: A client can sign up with email, password, and name (`POST /api/auth/sign-up/email`) and receives a valid session.
- **AC-2**: A client can sign in with a previously registered email and password (`POST /api/auth/sign-in/email`) and receives a valid session.
- **AC-3**: Every newly created user has `role` set to `PARTICIPANT` in the database. Sending a `role` field (e.g. `"ADMIN"`) in the sign up request body has no effect; the stored role is still `PARTICIPANT`.
- **AC-4**: Any route other than Better Auth's own handler routes rejects an unauthenticated request with `401`, unless the route is explicitly marked public.
- **AC-5**: Running the Better Auth Prisma migration creates the `user`, `session`, `account`, and `verification` tables, `user.role` is a two value enum (`PARTICIPANT`, `ADMIN`) defaulting to `PARTICIPANT`, and `npx prisma generate` produces a client with no type errors.

## Options considered

The engineer specified Better Auth and the `@thallesp/nestjs-better-auth` integration path from the outset. These are the alternatives not pursued, kept here for the record.

### Option 1: Better Auth via `@thallesp/nestjs-better-auth` (chosen)

A TypeScript first auth library with a community NestJS wrapper: a global `AuthGuard`, a `Session` decorator, and `@AllowAnonymous`/`@OptionalAuth` for the routes that should not require a session. Ships a Prisma adapter and a CLI that generates the schema for the project's own ORM.

**Pros**:
- Matches the stack exactly (Prisma adapter, TypeScript types inferred end to end).
- The route level protection (guard by default, opt out per route) matches "every route protected unless marked public" with no extra code.

**Cons**:
- The NestJS wrapper is community maintained, not an official NestJS or Better Auth package; slower to pick up upstream Better Auth changes.

### Option 2: NestJS Passport (`@nestjs/passport` with `passport-local` / `passport-jwt`)

The NestJS documented approach: hand rolled strategies, guards, and a manual password hashing and session/token flow.

**Pros**:
- Official NestJS ecosystem package, most examples and community support inside NestJS itself.

**Cons**:
- Every piece (password hashing, session storage, verification tokens, reset flow) is hand built and hand tested; more code to get right and to maintain.

### Option 3: Roll a custom auth module (bcrypt + JWT, no library)

Write the sign up, sign in, and guard logic directly against Prisma.

**Pros**:
- Full control, zero new dependencies.

**Cons**:
- Reinventing authentication is a well known failure pattern: password hashing, session/token expiry, and CSRF are each a potential breach if done by hand. Not worth it when a proven library fits the stack.

## Decision

**Chosen option**: Option 1: Better Auth via `@thallesp/nestjs-better-auth`

Use Better Auth with the Prisma adapter and the `@thallesp/nestjs-better-auth` NestJS wrapper, email and password only for now, and a server only `role` field defaulting to `PARTICIPANT`.

**Implementation skills**: `better-auth-best-practices` (`better-auth/skills`, `.agents/skills/better-auth-best-practices/`) · `create-auth` (`better-auth/skills`, `.agents/skills/create-auth/`)

## Rationale

Better Auth is the engineer's stated choice, and it fits the existing stack cleanly: the project already runs Prisma against Postgres, and Better Auth's Prisma adapter reuses that connection with no new database technology. The NestJS wrapper's guard-by-default behavior matches the project's own convention of registering a single global guard (already true for `ArcjetGuard`) rather than hand wiring auth checks per controller. Rolling custom auth (Option 3) was rejected because password and session handling done by hand is a common source of real breaches; NestJS Passport (Option 2) is viable but needs more first party code for the same result Better Auth gives out of the box.

The role requirement (`PARTICIPANT` default, `ADMIN` only assignable server side) is enforced with Better Auth's `additionalFields` mechanism using `input: false`, which the `better-auth-best-practices` skill documents as the way to add a field the client cannot set through the public API. This keeps the privilege check inside the library's own request handling rather than a bolt on check the team has to remember to keep in sync.

**Decisions made without a further question round** (the engineer asked for direct implementation; each call below follows the stack already in place):
- **Session storage**: the database (Postgres, through the existing Prisma connection), not a secondary store. There is no Redis or similar in this stack, and adding one only for sessions is not justified yet.
- **Rate limiting**: Better Auth's own default rate limiting stays on (its default, in memory). Arcjet's global guard already covers bot and abuse detection across every route including the auth ones; Better Auth's is a second, narrower layer specific to auth endpoints, and turning it off would need a specific reason that does not exist here.
- **Plugins**: none. No two factor, organizations, or admin plugin was requested; adding one now would be scope not asked for.
- **Config file location**: `src/lib/auth/auth.ts`, matching this project's convention of one folder per infrastructure integration under `src/lib/`.
- **`trustedOrigins`**: left at the default (empty) for now, since there is no frontend origin yet (Postman/curl only). Flagged in Follow up for whoever adds the first browser client.

## Feature design

**Data model sketch**:

Better Auth's standard schema, generated into `prisma/schema.prisma` by its CLI, with one addition (`role`):

- **User**: `id` (string, PK), `name` (string), `email` (string, unique), `emailVerified` (boolean, default false), `image` (string, nullable), `role` (`Role` enum, default `PARTICIPANT`, not settable by the client), `createdAt`, `updatedAt`. Has many `Session`, many `Account`.
- **Session**: `id` (string, PK), `token` (string, unique), `expiresAt` (datetime), `ipAddress` (string, nullable), `userAgent` (string, nullable), `userId` (FK to User, cascade delete), `createdAt`, `updatedAt`.
- **Account**: `id` (string, PK), `accountId` (string), `providerId` (string), `userId` (FK to User, cascade delete), `password` (string, nullable, holds the hashed password for the email and password provider), `createdAt`, `updatedAt`. (`accessToken`/`refreshToken`/`idToken` columns exist for social sign in later; unused while only email and password is enabled.)
- **Verification**: `id` (string, PK), `identifier` (string), `value` (string), `expiresAt` (datetime). Not used yet (no email verification flow), but part of Better Auth's required schema.
- **Role** (enum): `PARTICIPANT`, `ADMIN`.

**State transitions**: none beyond session lifecycle (created at sign in, deleted at sign out or expiry), which Better Auth manages internally.

**API surface** (Better Auth's own handler, mounted at the default `/api/auth` base path; no custom controllers are added by this spec):

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| /api/auth/sign-up/email | POST | email, password, name (req) | user (incl. role), session cookie | public | 422 invalid input, 409 email already registered |
| /api/auth/sign-in/email | POST | email, password (req) | user (incl. role), session cookie | public | 401 invalid credentials |
| /api/auth/sign-out | POST | none (session cookie) | success boolean | session required | 401 no active session |
| /api/auth/get-session | GET | none (session cookie) | session, user (incl. role) | session required | 401 no active session |

**Key invariants**:
- `user.role` is always `PARTICIPANT` or `ADMIN` (enforced at the database by the `Role` enum).
- `user.role` can never be set by a client request; it is a server controlled field (`input: false`) that only changes through a direct database update or a future admin-only endpoint, neither built by this spec.
- `user.email` is unique.
- A session always belongs to exactly one user and is removed when that user is removed (cascade).

**Security model**:
Every route except Better Auth's own `/api/auth/*` handler requires a valid session by default, enforced by the global `AuthGuard` from `@thallesp/nestjs-better-auth`. A route that should be reachable without a session must opt out explicitly with `@AllowAnonymous()` or `@OptionalAuth()`. No role gated routes exist yet (none were requested); `role` is available on the session's user object for a future authorization guard to read. No compliance scope applies (not payments, health, or otherwise regulated data).

**Configuration required**:
- `BETTER_AUTH_SECRET`: signing/encryption secret for sessions and tokens (already present in `.env`, confirm it is 32+ characters)
- `BETTER_AUTH_URL`: base URL Better Auth uses for cookies and callback construction (already present in `.env`)
- `DATABASE_URL`: reused from the existing Prisma setup, no new value needed

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):
- Happy path: sign up with a new email, password, and name returns a session and a user with `role: "PARTICIPANT"`, verifies **AC-1**, **AC-3**
- Happy path: sign in with that same email and password returns a new session, verifies **AC-2**
- Failure case: a sign up request that includes `"role": "ADMIN"` in the body still creates a `PARTICIPANT` user, verifies **AC-3**
- Auth/permission: a request to a non auth route with no session cookie returns 401, verifies **AC-4**

## Build plan

This is small enough to build as one end to end slice rather than phased, since there is no existing auth to migrate away from and no UI in this repo to sequence around (no build approach was recorded in `AGENTS.md` or a scope header; this default is stated here rather than assumed silently).

1. Install `better-auth` and `@thallesp/nestjs-better-auth`, satisfies **AC-1**, **AC-2**
2. Create `src/lib/auth/auth.ts`: a `betterAuth()` instance using the Prisma adapter (backed by the existing `PrismaService`), `emailAndPassword.enabled: true`, and a `user.additionalFields.role` field (`type: "string"`, `defaultValue: "PARTICIPANT"`, `input: false`), satisfies **AC-1**, **AC-2**, **AC-3**
3. Run the Better Auth CLI's `generate` command to add the `user`, `session`, `account`, and `verification` models to `prisma/schema.prisma`, then hand edit `user.role` to use a new `Role` enum (`PARTICIPANT`, `ADMIN`) defaulting to `PARTICIPANT`, satisfies **AC-3**, **AC-5**
4. Run `prisma migrate dev` to apply the schema and regenerate the Prisma client, satisfies **AC-5**
5. Disable Nest's built in body parser in `main.ts` (`bodyParser: false`) and import `AuthModule.forRoot({ auth })` (from `@thallesp/nestjs-better-auth`) into `AppModule`, satisfies **AC-1**, **AC-2**, **AC-4**
6. Verify end to end against the running dev server: sign up, sign in, and a rejected request to a protected route with no session, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**

## Consequences

**Positive**:
- Every route is authenticated by default the moment this ships; a new controller cannot be accidentally left open.
- Password handling, session issuance, and expiry are handled by a maintained library instead of hand rolled code.
- The role field is safe against a common privilege escalation bug (a client setting its own role at signup) by construction, not by a check someone has to remember to add.

**Negative / tradeoffs**:
- The NestJS wrapper is community maintained, not official; upstream Better Auth changes may lag behind before the wrapper catches up.
- No email verification and no password reset flow yet; a user who loses access to their password has no self serve recovery path until that is built.
- `trustedOrigins` is left at the default with no browser frontend configured; the first real frontend integration needs to come back and set this.

**Neutral**:
- Adds four new database tables (`user`, `session`, `account`, `verification`) and one enum (`Role`) to a previously model free Prisma schema.
- `Account` and `Verification` tables are provisioned now but unused until social sign in or email verification is added later.

## Follow-up

- [ ] No `docs/scope/` entry exists for this project yet (the whole directory is missing). Consider running `/scope` to track this and future features formally; this spec stands on its own until then.
- [ ] `better-auth-best-practices` and `create-auth` conventions are not yet referenced anywhere in project context. There is no `AGENTS.md` in this repo, only `CLAUDE.md`. Once one exists, an area file such as `src/lib/auth/AGENTS.md` should point to both skills (auth is a self contained area, not something every task touches).
- [ ] Email verification and password reset were explicitly out of scope this round; revisit once an email provider (e.g. a `src/lib/mail/` module, per this project's own infrastructure convention) is in place.
- [ ] `trustedOrigins` and cross origin cookie settings need real values once a browser based frontend exists.
- [ ] No mechanism exists yet to promote a user to `ADMIN`; the first admin account will need a direct database update until an admin-only endpoint is built.
- [ ] `ArcjetGuard` and Better Auth's `AuthGuard` are both global guards, and Arcjet's bot detection (`ARCJET_MODE=LIVE`) runs first. During verification, plain `curl` (even with a spoofed Postman user agent) was blocked by Arcjet's bot check on a plain Nest route (`/`) before Better Auth's guard was ever reached, session or no session. Better Auth's own `/api/auth/*` routes were unaffected (they are handled by middleware ahead of Nest's guard pipeline). Whoever adds the first real protected route should verify guard interaction with an actual browser or the Arcjet allow list, not `curl`.
