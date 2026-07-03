# Plan: S1 Room Entry And Live Presence

Goal: let a user open a room by name, join with remembered identity, and see a live participant roster backed by Supabase.

## Scope

In:

- first Supabase schema and local migration for rooms, settings, participants, and active round
- room lookup/create flow by room name
- join flow with unique display name and avatar
- local remembered `client_id`, name, and avatar
- realtime roster rendering and online presence
- copy invite link from the room page

Out:

- voting
- reveal and countdown
- kicking
- voter and spectator changes
- chaos events beyond placeholder seams

## Acceptance

- opening a new room name creates the room, default settings, and active round
- joining enforces unique display name within the room
- refresh on the same device reconnects to the same participant row
- two sessions see join and leave presence updates without refresh
- room page exposes copy invite link

## Assumptions

- avatar choices can start from a small static local set
- participant reconnect uses stored `client_id` first, with duplicate-name failure still shown cleanly if needed

## Tasks

- [T1] Add first Supabase migration and policies
  - Files/Areas: `supabase/migrations/`, `supabase/seed.sql` if needed
  - Depends on: none
  - Parallel: no
  - Validation: `npx.cmd supabase db reset`

- [T2] Add room and participant data modules
  - Files/Areas: `src/features/room/data/`, `src/lib/supabase/client.ts`, shared types as needed
  - Depends on: `T1`
  - Parallel: limited
  - Validation: typecheck passes and room create and join paths are callable from UI

- [T3] Add local identity persistence
  - Files/Areas: `src/features/identity/`, browser storage utilities, join form state
  - Depends on: `T2`
  - Parallel: yes
  - Validation: refresh restores prior name, avatar, and client identity locally

- [T4] Build join and room routes
  - Files/Areas: `src/routes/HomePage.tsx`, `src/routes/RoomPage.tsx`, feature UI and components
  - Depends on: `T2`, `T3`
  - Parallel: no
  - Validation: user can enter room name, join, see errors, and land in room view

- [T5] Add realtime roster and presence sync
  - Files/Areas: `src/features/room/realtime/`, `src/routes/RoomPage.tsx`
  - Depends on: `T2`, `T4`
  - Parallel: no
  - Validation: two local sessions reflect join and leave presence changes without reload

- [T6] Add invite link and final validation pass
  - Files/Areas: room page UI, small docs updates if needed
  - Depends on: `T4`, `T5`
  - Parallel: yes
  - Validation: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build`, manual two-session room flow

## Review

- keep Supabase access feature-local
- do not leak voting concepts into this slice
- prefer a simple reconnect path over premature session management

## Final Validation

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- manual check in two browser sessions:
  - create or open same room
  - join with distinct names
  - refresh one session and confirm identity reconnect
  - confirm roster and online presence update
  - confirm invite link copies correctly
