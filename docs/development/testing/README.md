# Testing Docs

This folder holds testing and validation guidance for the current stack.

## Current Docs

- [strategy.md](strategy.md): test-layer choices and default validation expectations
- [playwright-e2e.md](playwright-e2e.md): current browser E2E scope and command

## Current State

- unit tests cover pure room rules
- integration tests cover the home create/join flow
- architecture checks guard public-repo and frontend boundary risks
- one Playwright smoke test covers the simulator room happy path

## Manual Multiplayer Simulator

Use `/rooms/<room-name>/dev` to test multiplayer behavior from one browser.

- The normal room page remains `/rooms/<room-name>`.
- The simulator route writes to a deterministic sandbox room name, not the real room.
- Use the simulator route to spawn fake voters, simulate their votes, reveal, and exercise animation rules.
- Do not change the simulator to write to the real room; it may be deployed to production and must stay isolated from real users.
