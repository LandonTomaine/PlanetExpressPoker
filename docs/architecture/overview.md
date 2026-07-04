# Architecture Overview

Planet Express Poker is a small realtime web app built around room-based multiplayer estimation.

The chosen stack is:

- `React`
- `TypeScript`
- `Vite`
- `Supabase`
- `Motion`
- `Tailwind CSS`

## Purpose

This document captures the durable architecture for the repository:

- application shape
- major boundaries
- realtime model
- persistence model
- frontend and backend responsibilities
- testing boundaries

For initial table shape, see [data-model.md](data-model.md).

## System Shape

The system has two main parts:

- A browser client built with `React` and bundled with `Vite`
- A hosted `Supabase` backend for database, realtime, and optional edge/server functionality

This is intentionally a thin architecture. The app does not need a separate custom backend server in v1 unless a later requirement forces it.

## Architectural Priorities

- Fast room entry
- Reliable realtime room state
- Minimal backend surface area
- Strong animation and interaction quality
- Simple persistence model
- Easy hosted deployment

## High-Level Responsibilities

### Browser Client

The frontend owns:

- routing
- room UI
- avatar selection UI
- vote selection UI
- reveal and reset interactions
- countdown presentation
- animations and themed effects
- local device persistence for remembered name and avatar

The frontend should not own durable room truth. It may hold transient UI state, but persisted room and round state must come from Supabase-backed reads and writes.

### Supabase

Supabase owns:

- persisted room records
- persisted room settings
- persisted participant records
- persisted round and vote records
- realtime presence
- realtime event delivery for room changes and fun events

## Runtime Model

This app is a client-first SPA.

- `Vite` provides local development and production bundling.
- `React Router` should own navigation.
- Supabase client libraries should be used directly from the app for database and realtime access.

There is no SSR requirement in v1.

## Realtime Model

Realtime behavior is central to the product.

Use Supabase Realtime in two ways:

- `Presence` for who is currently in the room and active
- `Broadcast` for low-latency ephemeral room events

Recommended ownership:

- Presence:
  - participant online/offline state
  - current participant metadata needed live in-room
  - transient viewer state such as connected tab/session presence

- Broadcast:
  - reveal countdown start
  - fun event triggers
  - transient animation events
  - quick synchronization nudges for active clients

Use persisted database writes for durable game state:

- room creation
- room settings changes
- voter/spectator changes
- kicks
- current round state
- submitted votes
- reveal status
- reset status

Rule of thumb:

- If it must survive reconnect or reload, persist it.
- If it is cosmetic or short-lived, broadcast it.

## Persistence Model

The data model should stay simple and explicit.

Expected core entities:

- `rooms`
- `room_settings`
- `participants`
- `rounds`
- `votes`

Optional later entities:

- `fun_events`
- `avatar_catalog`

Persistence principles:

- Keep one active round per room in v1.
- Do not add round history unless the product changes.
- Keep participant role as a simple room-level state: `voter` or `spectator`.
- Store only the durable state needed to reconstruct the current room.

## Client State Model

Use three levels of state:

- Local component state:
  - menus
  - hover state
  - open dialogs
  - temporary form input

- Local persisted browser state:
  - remembered display name
  - remembered avatar
  - possibly last joined room shortcut

- Shared realtime state from Supabase:
  - room settings
  - participant list
  - role changes
  - vote state
  - reveal state
  - countdown state

Avoid adding a heavy client state library in v1 unless the app proves it needs one.

## UI Architecture

The UI should be organized by feature, not by generic component buckets alone.

Suggested top-level app areas:

- app shell
- room join/create flow
- room view
- participant roster
- voting deck
- reveal summary
- fun/reaction layer
- shared UI primitives

Themed effects should be layered on top of the core product flow, not intertwined with the persistence logic.

## Animation Architecture

Animation is a first-class product concern.

Use `Motion` for:

- card selection feedback
- countdown entrance/exit
- card flip reveal
- consensus celebrations
- ship fly-bys
- character pop-ins

Principles:

- Core interactions must remain readable when fun effects are disabled.
- Cosmetic events must not be required for understanding room state.
- Animation triggers should come from durable state transitions or explicit transient broadcast events.

## Backend Boundary Rules

Keep the frontend simple, but do not let it become a grab bag of ad hoc Supabase calls.

Recommended boundaries:

- Put Supabase access behind repo-local feature modules.
- Keep raw query shapes and row mapping near the feature that owns them.
- Centralize shared Supabase client creation and environment wiring.
- Validate user input before writes.
- Keep business rules in one clear place per feature path.

## Security and Access Model

There are no accounts in v1, but the app still needs bounded behavior.

Assumptions for v1:

- Room access is link-based.
- Participants self-identify with display name and avatar.
- The room is collaborative, not adversarial.

This means the security model should optimize for simplicity, not formal identity.

Still required:

- server-side validation for writes
- room-scoped access boundaries
- protection against malformed client payloads

## Deployment Shape

Expected deployment:

- static frontend on `Cloudflare Pages`
- hosted `Supabase` project for database and realtime

Do not plan around a user-hosted PC runtime for team usage.

## Suggested Repository Shape

Once scaffolded, the repo should roughly converge toward:

- `src/app/`
- `src/features/`
- `src/components/`
- `src/lib/`
- `src/styles/`
- `src/routes/`
- `src/types/`

Supabase-related code should likely live under:

- `src/lib/supabase/`
- `src/features/<feature>/data/`

## Testing Boundaries

Use three main layers:

- Unit tests for pure calculations and small state helpers
- Component/integration tests for important room workflows
- Browser E2E tests for the main multiplayer flow

Do not overbuild the test pyramid for v1. Focus on:

- score recommendation logic
- role changes
- reveal flow
- reconnect/presence correctness
- room settings persistence

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
