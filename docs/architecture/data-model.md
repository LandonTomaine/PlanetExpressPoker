# Data Model

This document defines the initial durable data shape for Planet Express Poker.

The goal is not to overdesign the backend. The goal is to store only the room state needed to reconstruct the current session cleanly after reload or reconnect.

## Design Rules

- Keep the schema explicit.
- Keep one active round per room.
- Do not store public round history in v1.
- Persist durable room truth.
- Use Realtime Presence and Broadcast for ephemeral state.

## Durable Tables

### `rooms`

Purpose:

- stable room identity
- shareable room address
- lifecycle container for settings, participants, and the active round

Suggested fields:

- `id` uuid primary key
- `name` text not null unique
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

Rules:

- room name must be unique
- room name is the primary human identifier

### `room_settings`

Purpose:

- persisted per-room product settings

Suggested fields:

- `room_id` uuid primary key references `rooms(id)` on delete cascade
- `deck_type` text not null default `'fibonacci'`
- `special_cards_enabled` boolean not null default false
- `special_cards` jsonb not null default `'[]'::jsonb`
- `auto_reveal_enabled` boolean not null default true
- `reveal_countdown_enabled` boolean not null default true
- `reveal_countdown_seconds` integer not null default 3
- `fun_level` text not null default `'chaotic'`
- `updated_at` timestamptz not null default now()

Suggested allowed values:

- `deck_type`: `fibonacci`
- `fun_level`: `disabled`, `chaotic`

Notes:

- Keep this record one-to-one with `rooms`
- `special_cards` allows the v1 optional set without inventing a larger deck system yet

### `participants`

Purpose:

- current room roster
- durable role and identity within the active room context

Suggested fields:

- `id` uuid primary key
- `room_id` uuid not null references `rooms(id)` on delete cascade
- `client_id` text not null
- `display_name` text not null
- `avatar_key` text not null
- `role` text not null default `'voter'`
- `is_kicked` boolean not null default false
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

Suggested constraints:

- unique (`room_id`, `display_name`)
- unique (`room_id`, `client_id`)

Suggested allowed values:

- `role`: `voter`, `spectator`

Notes:

- `client_id` is the locally remembered device/session identifier used to reconnect to the same participant row without accounts
- kicked participants stay marked as kicked until they are explicitly re-added or the row is replaced by product logic

### `rounds`

Purpose:

- current room estimation state

Suggested fields:

- `id` uuid primary key
- `room_id` uuid not null unique references `rooms(id)` on delete cascade
- `round_number` integer not null default 1
- `status` text not null default `'voting'`
- `countdown_started_at` timestamptz null
- `countdown_seconds` integer not null default 3
- `revealed_at` timestamptz null
- `reaction_kind` text null
- `last_reaction_kind` text null
- `updated_at` timestamptz not null default now()

Suggested allowed values:

- `status`: `voting`, `countdown`, `revealed`

Notes:

- one row per room
- reset does not create a new row in v1; it clears votes, increments `round_number`, and returns the round to `voting`
- `reaction_kind` stores the shared reveal GIF selected during reveal so every browser sees the same reaction
- `last_reaction_kind` lets the reveal transaction avoid immediately repeating the same GIF after reset

### `votes`

Purpose:

- each participant's current vote in the active round

Suggested fields:

- `round_id` uuid not null references `rounds(id)` on delete cascade
- `participant_id` uuid not null references `participants(id)` on delete cascade
- `card_value` text not null
- `submitted_at` timestamptz not null default now()

Suggested key:

- primary key (`round_id`, `participant_id`)

Notes:

- store `card_value` as text so numeric and special cards share one column
- numeric interpretation belongs in app logic

## Derived State

These should be computed, not persisted:

- vote average
- recommended score
- unanimous consensus detection
- `Discuss`
- `No recommendation`
- all-voters-have-voted check

## Ephemeral Realtime State

Use Supabase Realtime rather than durable tables for:

- online presence
- current connected tabs
- ship fly-by and explosion triggers
- Bender reactions
- cosmetic celebration events

Broadcast event examples:

- `reveal_countdown_started`
- `fun_event_triggered`
- `consensus_celebration`

## Local Identity Model

Because there are no accounts, the app needs a local client identity.

Suggested rule:

- generate a stable `client_id` locally
- store it in browser storage
- reuse it when rejoining a room

This allows:

- remembered name/avatar
- reconnect to the same participant row
- cleaner role and vote ownership semantics

## Reset Behavior

When a round resets:

- delete all `votes` for the room's current `round_id`
- increment `round_number`
- set `status = 'voting'`
- clear `countdown_started_at`
- clear `revealed_at`

## Kick Behavior

When a participant is kicked:

- prevent kicking the first participant ever created in the room; this participant is the room owner
- set `is_kicked = true`
- remove any active vote for that participant in the current round
- prevent the same `client_id` from silently reclaiming the row without explicit product handling

## Initial Migration Scope

The first schema migration should create:

- `rooms`
- `room_settings`
- `participants`
- `rounds`
- `votes`

It should not yet add:

- audit tables
- round history tables
- avatar catalog tables
- fun event persistence tables
- analytics tables
