# Browser E2E

Playwright protects one high-value browser path. Keep it sparse.

## Command

```powershell
npm.cmd run test:e2e
```

Requires local Supabase env values. Start local Supabase first:

```powershell
npm.cmd run supabase:start
npm.cmd run supabase:status
```

## Scope

- simulator room join
- fake participant spawn
- self and fake participant voting
- reveal
- result summary

Use `/rooms/<room-name>/dev` for E2E so the test does not affect real rooms.

## Rules

- Add only high-value browser tests.
- Prefer unit tests for calculation and validation rules.
- Prefer manual checks for fragile animation polish.
- Do not grow a broad browser suite without a real regression history.
