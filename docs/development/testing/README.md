# Testing

| Layer        | Command                         | Use for                                             |
| ------------ | ------------------------------- | --------------------------------------------------- |
| Unit         | `npm.cmd run test:unit`         | Pure rules under `src/**/*.test.*`                  |
| Integration  | `npm.cmd run test:integration`  | React flows under `tests/integration/`              |
| Architecture | `npm.cmd run test:architecture` | Repo safety, env shape, test wiring, and boundaries |
| E2E          | `npm.cmd run test:e2e`          | Two browser smoke paths under `tests/e2e/`          |

Unit tests run in Node. Integration tests run in jsdom. E2E requires local or hosted Supabase values from [getting-started.md](../getting-started.md).

Use the cheapest layer that proves the behavior. Run E2E for room flow, routing, or Supabase changes; keep animation checks manual when automation would be brittle.

## Manual Multiplayer Simulator

Use `/rooms/<room-name>/dev` to test multiplayer behavior from one browser.

- The normal room page remains `/rooms/<room-name>`.
- The simulator route writes to a deterministic sandbox room name, not the real room.
- Use the simulator route to spawn fake voters, simulate their votes, reveal, and exercise animation rules.
- Do not change the simulator to write to the real room; it may be deployed to production and must stay isolated from real users.
