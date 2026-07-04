# Security

This app is a public static frontend backed by Supabase. Treat all browser-delivered values as public.

## What Must Stay Private

Do not commit or expose:

- Supabase service-role keys
- Supabase database passwords
- Supabase personal access tokens
- Cloudflare API tokens
- GitHub tokens
- local `.env` files

The frontend may use only Supabase anon/publishable public keys.

## Fork And Pull Request Safety

Repository workflows are intended to be safe for public forks:

- CI runs on `pull_request` with local Supabase only.
- CI does not use repository secrets.
- Deploy runs only on `push` to `main`.
- Deploy is guarded to run only in `LandonTomaine/PlanetExpressPoker`.
- GitHub repository secrets are not copied to forks.

If you fork this repo and want your fork to deploy, update `.github/workflows/deploy-cloudflare.yml`, `wrangler.jsonc`, and `package.json` to point at your own repository/project/resources.

## Required GitHub Settings Before Going Public

Configure these in GitHub before making the repo public:

- Disable auto-merge unless you intentionally want it.
- Protect `main` with a ruleset or branch protection rule.
- Require pull requests before merging to `main`.
- Require status checks before merge.
- Require the CI checks for formatting, lint, typecheck, unit tests, architecture checks, build, and E2E.
- Block force pushes and branch deletion on `main`.
- Do not allow bypassing branch protection except for explicitly trusted maintainers.
- Set Actions workflow permissions to read-only by default.
- Require approval for first-time contributor workflow runs.
- Protect the `production` environment and require manual approval before deploy, if available for the repository plan.

## Cloudflare Token Scope

Use a least-privilege Cloudflare API token. It should only be able to deploy the intended Pages project/account. Do not use a broad account-admin token.

## Reporting

Do not open public issues containing secrets or sensitive deployment details. Rotate any exposed token immediately, then report the issue privately to the repository owner.
