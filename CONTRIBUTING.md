# Contributing

This is a small personal-use planning poker app. Keep changes focused, validated, and safe for a public repository.

## Setup

Use [docs/development/getting-started.md](docs/development/getting-started.md).

## Validation

Use [docs/development/safeguards.md](docs/development/safeguards.md).

## Rules

- Do not push directly to `main`; open a pull request for every change.
- Do not commit `.env`, tokens, database passwords, service-role keys, or provider secrets.
- Use only Supabase anon/publishable public keys in frontend or GitHub Actions config.
- Keep fork/PR workflows secret-free. Do not use `pull_request_target` for untrusted code.
- Deployments must run only from protected `main` and only against the intended Cloudflare/Supabase resources.
- Let the weekly Dependabot review workflow handle clean passing dependency PRs; do not merge dependency updates without passing CI.
- Do not add paid/commercial positioning while bundled third-party theme assets remain.
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
