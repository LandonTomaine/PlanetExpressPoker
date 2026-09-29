# Contributing

This is a small personal-use planning poker app. Keep changes focused, validated, and safe for a public repository.

## Setup

Use [docs/development/getting-started.md](docs/development/getting-started.md).

## Validation

Use [docs/development/safeguards.md](docs/development/safeguards.md).

## Trunk-Based Workflow

`main` is the only long-lived branch and the deployment source.

1. Start a short-lived `feature/`, `fix/`, `chore/`, or `codex/` branch from current `main`.
2. Keep one focused change per branch and open a pull request into `main`.
3. Rebase or update the branch when GitHub requires it, then squash-merge after all gates pass.
4. Delete the branch after merge.

## Main Protection

GitHub enforces this policy on `main`, including for administrators:

- no direct, force, or deletion pushes
- linear history and resolved review conversations
- current passing `validate`, `e2e`, and CodeQL analysis checks
- one non-stale code-owner approval from [@LandonTomaine](https://github.com/LandonTomaine)

`.github/CODEOWNERS` makes @LandonTomaine the code owner for all paths. The scheduled Dependabot workflow only reports readiness; it never substitutes for this approval.

GitHub does not let an author approve their own pull request. Owner-authored changes therefore need a second maintainer to open the PR from their own branch or fork so @LandonTomaine can provide the required approval. Do not bypass this policy silently.

## Rules

- Do not commit `.env`, tokens, database passwords, service-role keys, or provider secrets.
- Use only Supabase anon/publishable public keys in frontend or GitHub Actions config.
- Keep fork/PR workflows secret-free. Do not use `pull_request_target` for untrusted code.
- Deployments must run only from protected `main` and only against the intended Cloudflare/Supabase resources.
- Review each Dependabot PR after its checks pass; do not merge dependency updates without the required owner approval.
- Do not add paid/commercial positioning while bundled third-party theme assets remain.
- Do not add new third-party media without documenting source and usage rights in [ASSET_NOTICES.md](ASSET_NOTICES.md).
- Prefer small changes with clear validation over broad refactors.
- Update docs when setup, deployment, validation, theme assets, schema, or user-visible behavior changes.

## Pull Requests

All changes require a pull request into `main` and the protection gates above.

Include:

- what changed
- why it changed
- validation run
- skipped validation or residual risk
- asset source notes, if assets changed
