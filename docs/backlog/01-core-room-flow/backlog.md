# Core Room Flow Backlog

Status: Draft

Date: July 2, 2026

Requirement document: [../../product/requirements/00-product-prd.md](../../product/requirements/00-product-prd.md)

Backlog index: [../index.md](../index.md)

## Purpose

Deliver the smallest complete version of Planet Express Poker's main room loop:

- create or reopen a room by name
- join with remembered identity
- see who is present and who can vote
- submit hidden votes
- reveal with countdown and summary
- reset the round
- layer in optional Futurama-themed chaos without disrupting the core flow

This backlog covers the app's main v1 capability. It excludes deployment, accounts, integrations, chat, history, and admin-style permissions.

## Tracking Conventions

- `S#` means implementation slice.
- Slice status values: `todo`, `in-progress`, `done`, `blocked`.
- Keep slices small enough to plan and implement in one focused pass.
- Validation should prove user behavior, not just code shape.
- Browser E2E is optional until the repo adopts it; for now, use concrete local validation steps.

## Epic

Enable a small team to open a room, join quickly, estimate privately, reveal together, and enjoy a few themed room reactions with minimal setup.

## Features And Stories

### F1. Room Entry And Identity

User stories:

- As a participant, I want to create or reopen a room by unique name so repeat sessions are simple.
- As a participant, I want to join with a unique display name and avatar so people can recognize me.
- As a returning participant, I want the app to remember my last-used name and avatar on this device.
- As a participant, I want a copyable invite link so I can bring others into the room quickly.

Slices:

- `S1 Room entry and live presence` - `todo`
  - Outcome:
    - user can open a room by name
    - room is created on first access with default settings
    - user can join with unique display name and avatar
    - local client identity remembers last-used name and avatar
    - room shows current participant roster with voter or spectator role and online presence
    - invite link can be copied from the room view
  - Acceptance:
    - opening a new room name creates the room and its default durable state
    - joining fails cleanly on duplicate display name within the room
    - refreshing on the same device reconnects to the same participant identity
    - two browser sessions can see each other join or leave without page refresh
    - a kicked participant is out of scope for this slice
  - Validation:
    - local app can create a room, join from two sessions, and keep the roster in sync

### F2. Voting And Role Management

User stories:

- As a participant, I want to vote privately so other people do not influence me.
- As a participant, I want to know who has voted without seeing the actual card.
- As a participant, I want anyone to switch anyone between voter and spectator so the room stays casual.
- As a participant, I want spectators to remain visible without being able to vote.

Slices:

- `S2 Voting deck and private vote state` - `todo`
  - Outcome:
    - default Fibonacci deck is visible
    - only voters can submit or change a vote before reveal
    - room shows which voters have submitted without exposing selected cards
  - Acceptance:
    - spectator cannot cast a vote
    - voter can overwrite their hidden vote until reveal
    - non-voters remain visible in the room roster
  - Validation:
    - two-session local flow proves hidden voting and submitted-state sync

- `S3 Participant role changes and kicking` - `todo`
  - Outcome:
    - any participant can toggle any participant between voter and spectator
    - any participant can kick any participant
    - kicked participants cannot silently reclaim the room row
  - Acceptance:
    - role changes update the roster in realtime
    - kicked participant loses current vote and room access
  - Validation:
    - local multi-session flow proves role changes and kick behavior

### F3. Reveal, Summary, And Reset

User stories:

- As a participant, I want anyone to reveal so the session stays fast.
- As a participant, I want automatic reveal with a short countdown when all voters are done.
- As a participant, I want a clear recommendation after reveal.
- As a participant, I want anyone to reset the room for the next estimate.

Slices:

- `S4 Reveal countdown and card flip` - `todo`
  - Outcome:
    - any participant can trigger reveal
    - room auto-starts a visible `3...2...1` countdown when all voters have voted
    - cards reveal with an intentional flip animation
  - Acceptance:
    - manual reveal works before all votes are in
    - auto reveal starts only when all current voters have submitted
    - revealed state is consistent across connected clients
  - Validation:
    - local multi-session flow proves manual and automatic reveal behavior

- `S5 Score summary and round reset` - `todo`
  - Outcome:
    - revealed room shows average and recommended score
    - non-numeric cards are excluded from calculations
    - any participant can reset the round
  - Acceptance:
    - unanimous numeric votes return exact score
    - wide spread returns `Discuss`
    - no numeric votes returns `No recommendation`
    - reset clears votes and returns room to hidden voting state
  - Validation:
    - local scenarios cover normal, unanimous, spread, and non-numeric cases

### F4. Theme, Chaos, And Celebration

User stories:

- As a participant, I want the app to feel like Planet Express Poker rather than a generic tool.
- As a participant, I want fun room actions that are chaotic but not disruptive.
- As a participant, I want consensus to trigger a themed celebration.

Slices:

- `S6 Avatar set and baseline themed presentation` - `todo`
  - Outcome:
    - room uses a clean base UI with themed avatars, copy, and card treatment
    - avatar choices are distinct and recognizable
  - Acceptance:
    - theme is visible without making the app harder to read
  - Validation:
    - local visual review covers join flow, roster, cards, and reveal state

- `S7 Chaos events and consensus celebration` - `todo`
  - Outcome:
    - chaotic fun level enables short ship, prop, or character reactions
    - disabled fun level suppresses cosmetic events
    - consensus can trigger a stronger themed celebration
  - Acceptance:
    - fun events never alter vote or room state
    - reactions are short-lived and can be ignored
  - Validation:
    - local manual validation proves enabled and disabled fun modes

### Theme Follow-Ups

- Existing-room theme clarity - `todo`: Explain near room entry that the “New room theme” selector only applies when creating a new room; existing rooms keep their owner-selected theme.
- Database theme regression coverage - `todo`: Add a Supabase migration smoke test or SQL-level regression that proves `create_or_get_room(name, theme)` creates new rooms with the requested theme and does not retheme existing rooms.
- Theme ID extensibility - `todo`: Replace hardcoded database checks for `('futurama', 'zootopia')` with a more scalable compatibility plan before adding more built-in themes.

## Recommended Agent Work Order

1. `S1 Room entry and live presence`
2. `S2 Voting deck and private vote state`
3. `S3 Participant role changes and kicking`
4. `S4 Reveal countdown and card flip`
5. `S5 Score summary and round reset`
6. `S6 Avatar set and baseline themed presentation`
7. `S7 Chaos events and consensus celebration`

## Dependencies

- `S1` depends on the existing repo scaffold and local Supabase setup
- `S2` depends on `S1`
- `S3` depends on `S1` and should land before final reveal automation assumptions are locked
- `S4` depends on `S2`
- `S5` depends on `S4`
- `S6` can progress after `S1` but should stay aligned with the core room states
- `S7` depends on `S4` and `S6`

## Agent Handoff Guidance

Start with `S1`. Keep it narrow.

For `S1`, the first implementation plan should cover:

- room lookup or creation by name
- default room settings and active round initialization
- join flow with unique display name and avatar
- local remembered identity
- realtime roster and presence rendering
- copy invite link from the room view

Do not pull voting, reveal, kicking, or chaos triggers into the first slice unless a small supporting seam is unavoidable.
