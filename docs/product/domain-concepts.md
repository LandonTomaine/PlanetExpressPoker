# Domain Concepts

This document captures the first stable product concepts behind the app.

For table-level structure, see [../architecture/data-model.md](../architecture/data-model.md).

## Core Concepts

### Room

A room is the primary collaboration space.

A room:

- is identified by a unique name
- has one durable settings record
- has one current round state
- contains the current participant roster

The room name is the shareable address and the long-lived identity for repeated sessions.

### Room Settings

Room settings are durable and survive across repeat sessions in the same room.

Settings currently include:

- deck type
- enabled special cards
- auto-reveal enabled
- reveal countdown enabled
- fun level

These are room-level defaults, not per-user preferences.

### Participant

A participant is a current member of the room roster for the active session context.

A participant has:

- a display name
- an avatar
- a role: `voter` or `spectator`

Participants are product-visible room entities, not authenticated user accounts.

### Presence

Presence is separate from the persisted participant roster.

Use presence for:

- who is connected right now
- who is active in the room now

Use persisted participants for:

- roster state
- role changes
- kick state
- vote ownership

Rule:

- presence is ephemeral
- participant records are durable room state

### Round

A round is the current estimation cycle inside a room.

The product keeps only one current round per room in v1.

A round has:

- hidden voting state
- optional reveal countdown state
- revealed state

The round resets for the next estimate without maintaining public round history.

### Vote

A vote is a participant's current selection for the active round.

Rules:

- only voters can submit votes
- spectators cannot submit votes
- a participant may change their vote until reveal
- non-numeric cards do not affect average or recommendation

### Recommendation

Recommendation is derived state, not durable state.

Rules:

- unanimous numeric votes => exact score
- otherwise median numeric vote
- if spread is more than two Fibonacci steps => `Discuss`
- if no numeric votes => `No recommendation`

### Fun Event

A fun event is a cosmetic, short-lived event such as:

- ship fly-by
- collision/explosion
- thrown object
- character reaction

Fun events are transient and should not be persisted in v1 unless later debugging or replay needs justify it.

## State Ownership Rules

Persist:

- room identity
- room settings
- participant roster
- participant role
- active round status
- submitted votes

Do not persist by default:

- online presence
- animation state
- cosmetic chaos events
- hover, selection, or open-panel UI state

## Domain Boundaries

This product does not include:

- user accounts
- organization or team entities
- backlog items
- chat messages
- moderation history
- analytics/reporting models
- round history

If a future feature needs one of those, add it explicitly instead of smuggling it into the room model.
