# Tooling

Use [getting-started.md](getting-started.md) for first-time setup and the default local run flow.

Treat this document and the current `.husky/` files as the source of truth for local commands and hook behavior.

## Stack

This repository uses:

- `Node.js`
- `React`
- `TypeScript`
- `Vite`
- `Supabase`
- `Tailwind CSS`
- `Motion`

## Current Commands

- install dependencies
  - `npm install`
- run the frontend dev server
  - `npm run dev`
- typecheck
  - `npm run typecheck`
- unit tests
  - `npm run test:unit`
- integration tests
  - `npm run test:integration`
- public-readiness architecture checks
  - `npm run test:architecture`
- browser E2E smoke test
  - `npm run test:e2e`
- lint
  - `npm run lint`
- format
  - `npm run format`
- format check
  - `npm run format:check`
- production build
  - `npm run build`
- preview production build locally
  - `npm run preview`
- check Cloudflare Wrangler auth
  - `npm run cloudflare:whoami`
- deploy current build to Cloudflare Pages by direct upload
  - `npm run deploy:cloudflare`
- start local Supabase
  - `npm run supabase:start`
- stop local Supabase
  - `npm run supabase:stop`
- inspect local Supabase status and keys
  - `npm run supabase:status`

The local Supabase config currently keeps only the services needed for early app work. Studio, storage, analytics, and other optional services are disabled to keep local startup reliable on this machine.

## Linting And Formatting

The repo currently enforces:

- TypeScript typechecking
- ESLint
- Prettier

Style choices stay intentionally simple:

- one lint path
- one formatting path
- no custom source guards

## Git Hooks

The repo uses Husky.

Current hooks:

- `pre-commit`
  - `npx lint-staged`
- `pre-push`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run test:integration`
  - `npm run test:architecture`
  - `npm run build`

## CI And Security Scanning

GitHub Actions runs formatting, linting, typechecking, unit tests, integration tests, architecture checks, build, and the Playwright smoke test.

CodeQL runs on pushes to `main`, pull requests, and a weekly schedule. It is separate from local hooks because it depends on GitHub code scanning.

CodeRabbit review behavior is configured by `.coderabbit.yaml`. CodeRabbit is optional for forks; each fork owner must install it in their own GitHub account or organization if they want automated PR review.

## Validation Philosophy

- Keep local validation fast enough that it actually runs.
- Put cheap checks earlier than expensive checks.
- Keep E2E out of pre-push; run it when Supabase/browser behavior changed.
