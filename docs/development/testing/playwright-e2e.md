# Browser E2E

Playwright is not part of the active repo toolchain yet.

## Current Rule

Until Playwright is added:

- use manual browser validation for user-visible flow checks
- keep browser validation narrow and explicit in plans
- do not invent placeholder Playwright suites just to satisfy process

## Likely First E2E Scope

When Playwright is introduced, start with one happy-path multiplayer flow:

- create or open room
- join as participant
- submit votes
- reveal
- reset

Do not add broad browser coverage before the room flow is stable.
