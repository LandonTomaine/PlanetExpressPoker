# Project Safeguards

This repository uses layered safeguards to keep changes clean, tested, and safe to publish.

## Local Gates

Run these before pushing:

```powershell
npm.cmd run format:check
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run test:integration
npm.cmd run test:architecture
npm.cmd run build
```

Run E2E when browser behavior, room flow, Supabase integration, or routing changes:

```powershell
npm.cmd run test:e2e
```

Run dependency audit before release/publication:

```powershell
npm.cmd audit --audit-level=moderate
```

## Git Hooks

Husky enforces the common local checks.

- `pre-commit`: runs `lint-staged` to lint and format staged files.
- `pre-push`: runs lint, typecheck, unit tests, integration tests, architecture checks, and build.
- E2E stays manual/CI-only because it depends on browser and Supabase runtime setup.

## CI Gates

GitHub Actions protects pushes and pull requests with:

- Prettier format check
- ESLint
- TypeScript typecheck
- Unit tests
- Integration tests
- Public-readiness architecture checks
- Production build
- Playwright E2E smoke test with local Supabase

Deployment is handled by a separate Cloudflare Pages workflow guarded to the intended repository.

## Repository Controls

- `main` is the trunk branch.
- `CODEOWNERS` requires `@LandonTomaine` review.
- Public issues are enabled for bug reports and enhancement requests.
- Pull request merges require owner approval.

## Security And Public-Repo Checks

Security safeguards include:

- CodeQL scanning on pushes to `main`, pull requests, and a weekly schedule.
- Dependabot alerts and weekly update PRs for npm and GitHub Actions.
- `npm audit --audit-level=moderate` for local dependency vulnerability checks.
- `scripts/check-public-readiness.mjs` for repo-specific architecture/security checks.

The architecture check currently guards:

- required public-repo files exist
- no tracked `.env` files
- no obvious committed secrets or local machine paths
- no unsafe `pull_request_target` workflow usage
- workflows declare explicit permissions and do not grant `contents: write`
- deploy workflow has the intended repository guard
- frontend code avoids unsafe HTML rendering
- frontend code avoids direct sensitive table reads
- Supabase client imports stay behind the intended data/realtime boundaries

## Secrets And Deployment Safety

- Local `.env` files are ignored and must stay untracked.
- Frontend code may use only Supabase anon or publishable public keys.
- Never commit Supabase service-role keys, database passwords, API tokens, or access tokens.
- GitHub deployment secrets are repository settings, not source files.
- Forks must update the Cloudflare deploy repository guard before deploying to their own resources.

## Documentation And Ownership

Keep these docs aligned when safeguards change:

- [tooling.md](tooling.md): command and hook reference
- [testing/strategy.md](testing/strategy.md): test layer expectations
- [bootstrap-checklist.md](bootstrap-checklist.md): standards coverage ledger
- [../../README.md](../../README.md): setup and common validation commands
- [../../CONTRIBUTING.md](../../CONTRIBUTING.md): contributor validation rules
