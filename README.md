# Planet Express Poker

Lightweight planning poker with realtime rooms, persistent room state, animated reveal flow, and a chaotic Planet Express-inspired presentation layer.

## Stack

- React
- TypeScript
- Vite
- Supabase
- Motion
- Tailwind CSS
- Cloudflare Pages

## Prerequisites

- Node.js 24.x
- Git 2.32+
- Docker Desktop, only if you want a local Supabase stack
- A Supabase account for hosted shared rooms
- A Cloudflare account for hosted frontend deployment
- GitHub CLI is optional

PowerShell note: if `npm` or `npx` are blocked by execution policy, use `npm.cmd` and `npx.cmd`.

## Quick Start

```powershell
git clone https://github.com/LandonTomaine/PlanetExpressPoker.git
cd PlanetExpressPoker
npm.cmd install
```

Choose the smallest path that fits:

- local Supabase or hosted Supabase for local development: [docs/development/getting-started.md](docs/development/getting-started.md)
- Cloudflare Pages + hosted Supabase deployment: [docs/deployment/cloudflare-pages.md](docs/deployment/cloudflare-pages.md)
- full fork setup with your own resources: [docs/deployment/fork-setup.md](docs/deployment/fork-setup.md)

Default local app URL: `http://127.0.0.1:5173`

## Local Env

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-or-publishable-public-key>
```

GitHub secrets do not populate your local shell or `.env`. Local development always needs local values.

Use only the Supabase anon/publishable public key in frontend or GitHub configuration. Never use the secret or service-role key in this app.

## Validation

Run before opening or updating a pull request:

```powershell
npm.cmd run format:check
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run test:integration
npm.cmd run test:architecture
npm.cmd run build
```

Run the browser smoke test when `.env` points at a local or hosted Supabase project:

```powershell
npm.cmd run test:e2e
```

Dependency audit:

```powershell
npm.cmd audit --audit-level=moderate
```

## Public Repo Notes

This repository intentionally ignores local `.env` files. Do not commit hosted Supabase keys, Cloudflare API tokens, database passwords, or Supabase access tokens.

The app includes Futurama/Planet Express-inspired media assets for private, personal, non-commercial use. The source code is MIT-licensed, but bundled media/theme assets are not. Do not sell or monetize the app as shipped. Replace the themed assets before commercial use or reusable public-product use.

- License: [LICENSE.md](LICENSE.md)
- Asset notices: [ASSET_NOTICES.md](ASSET_NOTICES.md)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
- Security: [SECURITY.md](SECURITY.md)

## Codex Pull Request Reviews

This repository uses the ChatGPT/Codex GitHub connector for pull request review.

Codex review is configured outside the repository through the ChatGPT/Codex GitHub app. It can automatically review new pull requests and can also be requested in a pull request with `@codex review`.

Forks do not inherit this repository's Codex GitHub connector configuration, GitHub secrets, Cloudflare account, or Supabase project.

## Common Commands

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run preview
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run test:integration
npm.cmd run test:architecture
npm.cmd run test:e2e
npm.cmd run format
npm.cmd run supabase:start
npm.cmd run supabase:stop
npm.cmd run supabase:status
```

## Docs Map

- Shared docs index: [docs/README.md](docs/README.md)
- Local setup: [docs/development/getting-started.md](docs/development/getting-started.md)
- Tooling and safeguards: [docs/development/README.md](docs/development/README.md)
- Deployment: [docs/deployment/cloudflare-pages.md](docs/deployment/cloudflare-pages.md)
- Fork setup: [docs/deployment/fork-setup.md](docs/deployment/fork-setup.md)
- Architecture: [docs/architecture/overview.md](docs/architecture/overview.md)
