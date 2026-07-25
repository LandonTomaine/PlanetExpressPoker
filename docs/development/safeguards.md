# Safeguards

## Before Push

```powershell
npm.cmd run format:check
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run test:integration
npm.cmd run test:architecture
npm.cmd run build
```

Run `npm.cmd run test:e2e` for room flow, routing, or Supabase changes. Run `npm.cmd audit --audit-level=moderate` before release.

## Automated Gates

- Pre-commit: lint and format staged files.
- Pre-push: format, lint, typecheck, unit, integration, architecture, build.
- CI: all local gates plus Playwright with local Supabase.
- CodeQL and Dependabot: GitHub-hosted security checks.
- Deploy: protected `main`, guarded repository, hosted migrations before upload.

## Architecture Check

`scripts/check-public-readiness.mjs` guards:

- required public-repo files
- test scripts wired into CI and pre-push
- ignored local env files and the public-only `.env.example` shape
- obvious committed secrets, local paths, and mojibake
- safe workflow permissions and deploy repository guard
- no unsafe HTML or direct sensitive-table reads
- Supabase imports and frontend env variables staying inside approved boundaries

See [testing/README.md](testing/README.md) for layer selection, [../deployment/fork-setup.md](../deployment/fork-setup.md) for fork deployment, and [../../SECURITY.md](../../SECURITY.md) for secret handling.
