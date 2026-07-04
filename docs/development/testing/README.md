# Testing Docs

This folder holds testing and validation guidance for the current stack.

## Current Docs

- [strategy.md](strategy.md): test-layer choices and default validation expectations
- [playwright-e2e.md](playwright-e2e.md): reserved guidance for browser E2E once the repo adopts Playwright

## Current State

- unit and integration guidance is active now
- browser E2E is intentionally deferred until the first real room workflow stabilizes

## Manual Multiplayer Simulator

Use `/rooms/<room-name>/dev` to test multiplayer behavior from one browser.

- The normal room page remains `/rooms/<room-name>`.
- The simulator route writes to a deterministic sandbox room name, not the real room.
- Use the simulator route to spawn fake voters, simulate their votes, reveal, and exercise animation rules.
- Do not change the simulator to write to the real room; it may be deployed to production and must stay isolated from real users.
