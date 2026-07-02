# Backend Standards

The backend platform is `Supabase`.

## Goals

- Keep the backend small.
- Persist only the state needed to reconstruct the current room.
- Use realtime intentionally instead of mixing durable and transient state carelessly.

## Backend Shape

Supabase is the system of record for:
- room records
- room settings
- participants
- rounds
- votes

Use:
- database tables for durable state
- Realtime Presence for online participant presence
- Realtime Broadcast for transient room events

## Data Rules

- Prefer explicit tables over clever polymorphic storage in v1.
- Keep one active round per room.
- Do not add historical reporting structures unless the product changes.
- Store participant role as `voter` or `spectator`.

## Write Rules

- Validate incoming payloads before writes.
- Keep room mutations small and explicit.
- Do not rely on the client alone for protecting data shape.
- Avoid hidden write side effects unless clearly documented.

## Realtime Rules

- Persist durable room truth.
- Broadcast only ephemeral events.
- Presence should represent connected users, not replace persisted participant records.

## Recommended Feature Boundaries

Keep backend access grouped by feature path:
- room creation and lookup
- participant join and leave
- role and kick changes
- vote submission
- reveal and reset
- fun event broadcast

## Complexity Guardrails

- No custom backend service in v1 unless Supabase becomes a blocker.
- No queueing or background job layer by default.
- No premature analytics/reporting backend.
- No custom websocket server.
