# Contributing

This is a small personal-use planning poker app. Keep changes focused, validated, and safe for a public repository.

## Setup

```powershell
npm.cmd install
Copy-Item .env.example .env
npm.cmd run supabase:start
npm.cmd run supabase:status
npm.cmd run dev
```

Copy the local Supabase anon or publishable key from `supabase:status` into `.env`.

For hosted Supabase or Cloudflare setup, use [README.md](README.md) and [docs/deployment/cloudflare-pages.md](docs/deployment/cloudflare-pages.md).

## Validation

Run before pushing:

```powershell
npm.cmd run format:check
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run test:integration
npm.cmd run test:architecture
npm.cmd run build
```

Run E2E when `.env` points at a usable Supabase project:

```powershell
npm.cmd run test:e2e
```

## Rules

- Do not push directly to `main`; open a pull request for every change.
- Do not commit `.env`, tokens, database passwords, service-role keys, or provider secrets.
- Use only Supabase anon/publishable public keys in frontend or GitHub Actions config.
- Keep fork/PR workflows secret-free. Do not use `pull_request_target` for untrusted code.
- Deployments must run only from protected `main` and only against the intended Cloudflare/Supabase resources.
- Let the weekly Dependabot review workflow handle clean passing dependency PRs; do not merge dependency updates without passing CI.
- Do not add paid/commercial positioning while the bundled Futurama / Planet Express-inspired assets remain.
- Do not add new third-party media without documenting source and usage rights in [ASSET_NOTICES.md](ASSET_NOTICES.md).
- Prefer small changes with clear validation over broad refactors.
- Update docs when setup, deployment, validation, theme assets, schema, or user-visible behavior changes.

## Pull Requests

All changes require a pull request into `main`.

Include:

- what changed
- why it changed
- validation run
- skipped validation or residual risk
- asset source notes, if assets changed
