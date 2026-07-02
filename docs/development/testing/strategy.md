# Testing Strategy

Use the lightest testing stack that still protects the multiplayer room flow.

## Priorities

- Protect score calculation correctness
- Protect room-state transitions
- Protect reveal/reset behavior
- Protect role changes and spectator behavior
- Protect key UI flows

## Test Layers

### Unit

Use unit tests for:
- average calculation
- recommendation calculation
- Fibonacci helpers
- edge-case vote handling
- small pure state helpers

### Component / Integration

Use component or integration tests for:
- join flow
- room roster rendering
- voter vs spectator behavior
- vote selection and replacement
- reveal summary rendering
- disabled fun mode behavior where relevant

### Browser E2E

Use browser E2E tests sparingly for:
- create/join room
- two-participant happy-path vote and reveal
- persisted room settings across reload

## Default Validation Bias

- Prefer unit/integration coverage for most product rules.
- Use E2E for the main multiplayer confidence path, not every edge case.
- Validate user-visible animation behavior manually when automated checks would be brittle.

## What Must Be Verified Before Calling Work Done

- The main room flow still works.
- Votes remain hidden until reveal.
- Spectators cannot vote.
- Reveal and reset behave correctly.
- Recommended score logic matches documented rules.

## Anti-Goals

- No oversized E2E suite in v1.
- No animation snapshot obsession.
- No testing layers added just because a tool exists.
