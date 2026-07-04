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
- Git
- Docker Desktop, only if you want to run a local Supabase stack
- A Supabase account for hosted shared rooms
- A Cloudflare account for hosted static frontend deployment
- GitHub CLI is optional; the normal setup can be done through the GitHub website

PowerShell note: if `npm` or `npx` are blocked by execution policy, use `npm.cmd` and `npx.cmd`.

## Clone And Install

```powershell
git clone https://github.com/LandonTomaine/PlanetExpressPoker.git
cd PlanetExpressPoker
npm.cmd install
```

## Local Frontend With Hosted Supabase

Use this when you want to run the app on another computer but still point at a hosted Supabase project.

1. Create `.env` in the repo root:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-or-publishable-public-key>
```

2. Start Vite:

```powershell
npm.cmd run dev
```

3. Open:

```text
http://127.0.0.1:5173
```

GitHub secrets are only used by GitHub Actions. They do not automatically exist on a new local machine, so local development still needs `.env`.

## Local Frontend With Local Supabase

Use this when you want everything local.

1. Copy the sample env:

```powershell
Copy-Item .env.example .env
```

2. Start Docker Desktop.

3. Start Supabase:

```powershell
npm.cmd run supabase:start
```

4. Confirm local service info:

```powershell
npm.cmd run supabase:status
```

5. Copy the displayed local publishable or anon public key into `.env` as `VITE_SUPABASE_ANON_KEY`.

6. Start Vite:

```powershell
npm.cmd run dev
```

7. Open:

```text
http://127.0.0.1:5173
```

Stop local Supabase when finished:

```powershell
npm.cmd run supabase:stop
```

## Create A Hosted Supabase Project

1. Create a new Supabase project.

2. Save these values:

- Project ref
- Database password
- Project URL
- Anon or publishable public key

3. Create a Supabase personal access token from the Supabase dashboard.

4. Link the repo to the hosted project:

```powershell
$env:SUPABASE_ACCESS_TOKEN="<supabase-access-token>"
$env:SUPABASE_DB_PASSWORD="<database-password>"
npx.cmd supabase link --project-ref <project-ref>
```

5. Apply database migrations:

```powershell
npx.cmd supabase db push
```

6. Put the hosted values in `.env` for local development:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-or-publishable-public-key>
```

Use only the Supabase anon/publishable public key in frontend or GitHub configuration. Never use the secret or service-role key in this app.

## Public Repo Notes

This repository intentionally ignores local `.env` files. Do not commit hosted Supabase keys, Cloudflare API tokens, database passwords, or Supabase access tokens.

The app includes Futurama/Planet Express-inspired media assets for personal use. Review or replace those assets before treating this as a reusable open-source project.

## GitHub Secrets For Deployment

Add these repository secrets in GitHub:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

The `VITE_SUPABASE_*` secrets should point at the hosted Supabase project, not local Supabase.

## Cloudflare Pages Deployment

This repo deploys through GitHub Actions on every push to `main`.

1. Create a Cloudflare API token with permission to deploy Cloudflare Pages.

2. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub repository secrets.

3. Confirm the Cloudflare Pages project name matches `wrangler.jsonc` and the deploy workflow:

```text
planet-express-poker
```

4. Push to `main`:

```powershell
git push origin main
```

GitHub Actions will build with the hosted Supabase secrets and deploy `dist` to Cloudflare Pages.

## Manual Cloudflare Deploy

Use this only when you want to deploy from your local machine instead of GitHub Actions.

1. Create `.env.production`:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-or-publishable-public-key>
```

2. Log in to Cloudflare:

```powershell
npx.cmd wrangler login
```

3. Deploy:

```powershell
npm.cmd run deploy:cloudflare
```

## Validation Commands

Run these before pushing changes:

```powershell
npm.cmd run format:check
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run test:architecture
npm.cmd run build
```

Run the browser smoke test when local Supabase is running:

```powershell
npm.cmd run test:e2e
```

Dependency audit:

```powershell
npm.cmd audit --audit-level=moderate
```

## Common Commands

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run preview
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run test:architecture
npm.cmd run test:e2e
npm.cmd run format
npm.cmd run supabase:start
npm.cmd run supabase:stop
npm.cmd run supabase:status
```

## More Docs

- Local setup: `docs/development/getting-started.md`
- Tooling: `docs/development/tooling.md`
- Deployment: `docs/deployment/cloudflare-pages.md`
- Architecture: `docs/architecture/overview.md`
