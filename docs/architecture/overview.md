# Architecture Overview

Planet Express Poker is a small realtime web app built around room-based multiplayer estimation.

The chosen stack is:

- `React`
- `TypeScript`
- `Vite`
- `Supabase`
- `Motion`
- `Tailwind CSS`

## Runtime Shape

- Browser SPA: React Router, React, Vite
- Shared backend: Supabase Postgres, RPCs, Realtime
- Hosting: Cloudflare Pages

There is no SSR or separate custom backend service. See [data-model.md](data-model.md) for the logical schema.

## State Ownership

- Postgres/RPCs: rooms, settings, theme, participants, roles, kicks, rounds, votes, reveal/reset state, and selected reveal reaction
- Postgres change subscriptions: shared durable-state updates
- Presence: connected participant/session state
- Broadcast: manual and secret cosmetic events
- Browser storage: remembered identity, avatar, and personal page theme
- Component state: forms, dialogs, selections, and animation progress

Persist anything needed after reload. Keep animation progress and other cosmetic state transient.

## Persistence Rules

- Keep one current round row per room.
- Keep participant role as `voter` or `spectator`.
- Do not add public round history, analytics, or event logs without a product requirement.
- Keep private operational hashes in server-only tables and security-definer RPCs.
- Do not add a client state library without a demonstrated need.

## Source Boundaries

- `src/app/`: shell, router, and route loading
- `src/routes/`: page orchestration
- `src/features/room/data/`: all room RPC/query shapes and row mapping
- `src/features/room/realtime/`: room subscriptions and presence
- `src/features/room/`: room rules, voting, summary, and effects
- `src/features/identity/`: browser identity and avatar helpers
- `src/features/theme/`: built-in registry and active-theme context
- `src/lib/supabase/`: shared client creation only
- `supabase/migrations/`: schema and server-side behavior

Route components may orchestrate features but must not read sensitive tables directly. Keep Supabase access behind room data/realtime modules. Keep theme copy and media in the registry; see [../development/themes.md](../development/themes.md).

Core controls and score state must stay readable with effects disabled or reduced motion. Cosmetic events must never determine game state.

## Security and Access Model

- Room access is link-based; participants self-identify without accounts.
- Validate writes in security-definer RPCs, not only in the client.
- Keep reads and mutations room-scoped.
- Treat browser-delivered values as public.
- Keep service credentials and operational hashes server-side.

## Deployment Shape

Current deployment:

- static frontend on `Cloudflare Pages`
- hosted `Supabase` project for database and realtime

Do not plan around a user-hosted PC runtime for team usage.

## Testing Boundaries

Use unit tests for pure rules, integration tests for room/UI behavior, E2E for the two main browser smoke paths, and architecture checks for boundary/security rules. See [../development/testing/README.md](../development/testing/README.md).

## Non-Goals

This architecture does not include:

- SSR
- native mobile apps
- accounts/auth-heavy identity model
- integrations
- chat
- microservices
- custom websocket infrastructure

## Decision Defaults

- Prefer one hosted backend platform over a split backend stack.
- Prefer durable database state over clever in-memory coordination.
- Prefer broadcast for cosmetic/transient events only.
- Prefer feature-local modules over global abstractions.
- Prefer simple room truth over speculative extensibility.
