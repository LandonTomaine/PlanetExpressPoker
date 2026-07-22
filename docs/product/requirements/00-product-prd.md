# Planet Express Poker

## Product Requirements Document

### Status

Draft v1

### Date

July 1, 2026

### Delivery Backlog

- [../../backlog/01-core-room-flow/backlog.md](../../backlog/01-core-room-flow/backlog.md)

## 1. Product Summary

Planet Express Poker is a lightweight planning poker web app for small teams and friends. Users join a room with a unique display name and themed avatar, vote privately using planning poker cards, and reveal scores together with playful animations and Futurama-inspired social chaos.

The product is intentionally narrow. It is not a general agile platform, not a backlog tool, and not a team management product. The goal is to make estimation fast, readable, and entertaining.

## 2. Goals

- Make it possible to start a planning poker session in seconds.
- Keep the core estimation loop extremely simple.
- Add a fun social layer through themed avatars, animations, and triggered room events.
- Persist room settings by room name so repeat sessions are frictionless.
- Support casual participation with easy switching between voter and spectator states.

## 3. Non-Goals

- No accounts
- No chat
- No backlog or story management
- No Jira, Linear, GitHub, or other integrations
- No AI scoring or automatic estimation
- No retrospectives, standups, or other agile ceremony tools
- No complex permissions or role hierarchy
- No round history beyond the current active round
- No mobile-first optimization requirement, though responsive behavior is still acceptable

## 4. Target User

The target user is a small private group that wants a simple planning poker room with more personality than existing tools. The product is for personal use, not a commercial enterprise audience.

## 5. Core Product Principles

- Fast to enter
- Minimal UI
- Clear real-time state
- Strong reveal moment
- Fun can be chaotic, but must be disableable
- Theme should come mostly from characters, avatars, props, and reactions, not from making the whole interface hard to use

## 6. Primary User Stories

- As a host, I want to create a room with a unique name so I can reuse it later.
- As a returning participant, I want the room settings to persist so I do not need to reconfigure the session every time.
- As a participant, I want to join with my own display name and avatar so people can recognize me.
- As a participant, I want to see who is in the room and whether they are voting or spectating.
- As a participant, I want to vote privately so others do not influence my estimate.
- As a participant, I want to know who has voted without seeing their actual vote.
- As a participant, I want anyone to be able to reveal so the room stays casual and fast.
- As a participant, I want automatic reveal with a short countdown when all voters are done.
- As a participant, I want to switch myself or others between voter and spectator so non-voters can still be present.
- As a participant, I want to remove disruptive people from the room if needed.
- As a participant, I want the app to celebrate consensus and add funny moments during the session.

## 7. Functional Requirements

### 7.1 Room Creation and Persistence

- A room is created by unique room name.
- Room names must be shareable and reusable.
- Room settings persist by room.
- A room can be reopened later using the same room name.
- A room should provide a shareable invite link.
- The app should provide a one-click `Copy invite link` action.

### 7.2 Joining a Room

- A user can join a room without creating an account.
- A user must provide a unique display name within the room.
- A user selects an avatar when joining.
- The app should remember the user's last-used display name and avatar on the same device.

### 7.3 Presence

- The room shows all connected participants.
- Each participant is visibly marked as either `Voter` or `Spectator`.
- The room shows whether a voter has already submitted a vote in the current round.
- Votes remain hidden until reveal.

### 7.4 Voting

- Default deck is Fibonacci.
- Initial default deck values should be: `0, 1, 2, 3, 5, 8, 13, 21`.
- The room may optionally include special cards like `?`, `infinity`, and `coffee`.
- Only users currently marked as voters can submit a vote.
- Spectators remain visible in the room but cannot vote.
- A voter can change their vote until reveal.

### 7.5 Reveal

- Any participant can trigger reveal.
- If all current voters have voted, the app should automatically start a reveal countdown.
- The countdown should be visible and short: `3... 2... 1... reveal`.
- Revealed cards should animate with a card-flip effect.

### 7.6 Round Reset

- Any participant can reset the round after reveal.
- Reset clears all current votes and returns the room to hidden voting state.
- The app does not need to store prior rounds.

### 7.7 Participant State Changes

- Any participant can change any participant between voter and spectator.
- Any participant can kick non-owner participants from the room.
- The first participant to join a room is treated as the room owner and cannot be kicked.

### 7.8 Score Summary

- After reveal, the app shows all revealed votes.
- The app shows the average of the numeric votes.
- The app shows a recommended score.
- If all numeric votes match, the recommended score is that exact value.
- Otherwise, the recommended score is the median numeric vote.
- If the highest numeric vote is more than two Fibonacci steps above the lowest numeric vote, the app shows `Discuss` instead of a numeric recommendation.
- Non-numeric cards like `?`, `infinity`, and `coffee` are excluded from average and recommendation calculations.
- If there are no numeric votes after reveal, the app shows `No recommendation`.

### 7.9 Fun and Chaos Layer

- The room supports a `Fun level` setting.
- `Chaotic` should be the intended default.
- Fun can be disabled.
- Fun effects are cosmetic only and must not alter voting results or room state.
- Fun events should be short and interruptible, not persistent distractions.

### 7.10 Theme and Reactions

- The app supports built-in themes for private personal use. Current built-in themes are Futurama, Zootopia, and Toy Story.
- Users can choose a personal theme for non-room pages, and room owners can choose the persisted room theme.
- The base UI should remain clean and readable.
- Theme should primarily appear in avatars, card art, reveal celebrations, throwables, props, and transient character appearances.

## 8. Content and Interaction Requirements

### 8.1 Avatar System

- Users choose from a set of themed avatars.
- Avatars should be visually distinct and recognizable at small size.
- Avatars may include character-inspired options and theme-specific variants.

### 8.2 Throwables and Room Events

- Participants can trigger fun actions at each other.
- Possible examples include a theme vehicle fly-by, a vehicle stunt near a participant, thrown props or junk, and small environmental effects such as flashes, shakes, or smoke.
- These actions should be fast, readable, and not bury the core estimation flow.

### 8.3 Character Reactions

- Theme characters may appear in short reactions.
- Consensus on the same score should trigger a special celebration.
- Quotes or short themed voice-line-style text may be used sparingly.
- The app should avoid flooding the screen with repeated reactions.

## 9. Default Room Settings

- Deck: Fibonacci
- Special cards: disabled by default
- Reveal permission: anyone
- Auto reveal: enabled
- Auto reveal countdown: enabled, `3...2...1`
- Fun level: chaotic
- Spectators allowed: yes

## 10. UX Requirements

- A new user should understand how to join and vote without instructions.
- The main room should prioritize participants, card deck, vote status, reveal and reset actions, and score summary after reveal.
- The design should not lean too hard on spaceship dashboard visuals.
- Animations should feel polished and intentional, especially for vote selection, reveal countdown, card flips, consensus celebration, and triggered chaos events.

## 11. Technical and Product Constraints

- No account system
- Room settings must persist without requiring login
- Real-time updates are required for presence, vote status, reveal, reset, and fun events
- The product should work well on desktop browsers
- Basic responsiveness is useful, but mobile optimization is not a primary v1 requirement

## 12. Open Questions

- Exact scope of avatar library at launch
- Exact list of fun actions available in v1
- Whether kicking a participant should require a confirmation step
- Whether reset should remain open to all participants or follow a narrower rule later if misuse appears

## 13. Suggested v1 Scope

### Must Have

- Unique room creation by name
- Persisted room settings
- Join by display name
- Avatar selection
- Remember my name and avatar locally
- Presence list
- Voter and spectator modes
- Hidden voting
- Vote submitted indicator
- Fibonacci deck
- Anyone can reveal
- Auto reveal countdown
- Card flip reveal animation
- Average and recommended score
- Copy invite link
- Kick participant
- Fun level toggle including disabled mode
- At least a small set of themed reactions and celebrations

### Nice to Have

- Special cards: `?`, `infinity`, `coffee`
- Multiple avatar variants per character/theme
- Extra celebration variants
- More than one throwable or chaos interaction
- Slightly responsive tablet/mobile layout

### Out of Scope

- Accounts
- Authentication
- Private admin controls
- Integrations
- Chat
- Round history
- Story text management
- Backlog import
- AI features

## 14. Success Criteria

- A room can be created and joined in under 30 seconds.
- Participants can complete a vote and reveal cycle without explanation.
- Fun effects add personality without slowing down the estimation flow.
- Repeat sessions in the same room preserve expected settings.
- The product feels intentionally small rather than incomplete.
