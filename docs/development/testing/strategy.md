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

Use `npm run test:unit` for:

- average calculation
- recommendation calculation
- Fibonacci helpers
- edge-case vote handling
- small pure state helpers

### Component / Integration

Use `npm run test:integration` for:

- join flow
- room roster rendering
- voter vs spectator behavior
- vote selection and replacement
- reveal summary rendering
- disabled fun mode behavior where relevant

### Browser E2E

Use `npm run test:e2e` sparingly for:

- two-participant happy-path vote and reveal
- simulator room join
- result summary smoke coverage

Add persisted-room or reload E2E only after a real regression justifies it.

### Architecture Checks

Use `npm run test:architecture` for:

- no tracked local env files
- no obvious committed secrets
- CodeQL workflow presence
- required public-repo files such as license, asset notices, and contribution guidance
- Dependabot config exists for dependency update visibility
- GitHub Actions workflows avoid unsafe fork/deploy triggers
- no unsafe HTML rendering
- no direct frontend reads from sensitive room tables
- Supabase client imports staying behind room data/realtime boundaries

## Default Validation Bias

- Prefer unit/integration coverage for most product rules.
- Use E2E for the main multiplayer confidence path, not every edge case.
- Keep architecture checks cheap enough for pre-push and CI.
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
