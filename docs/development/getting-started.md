# Getting Started

This repository uses:

- `Node.js`
- `React`
- `TypeScript`
- `Vite`
- `Supabase`

## Prerequisites

- Node.js `24.x` is the current known-good local version in this repo
- Git `2.32+`
- Docker Desktop, only if you want to run the local Supabase stack
- A Supabase account, only if you want a hosted shared environment
- A Cloudflare account, only if you want to deploy your own hosted frontend

PowerShell may block npm shims. Use `npm.cmd` and `npx.cmd` if needed.

## Local Frontend With Local Supabase

1. `npm.cmd install`
2. `Copy-Item .env.example .env`
3. `npm.cmd run supabase:start`
4. `npm.cmd run supabase:status`
5. Put the displayed anon/publishable key in `.env` as `VITE_SUPABASE_ANON_KEY`.
6. `npm.cmd run dev`
7. Open `http://127.0.0.1:5173`.

Stop local Supabase when finished:

- `npm.cmd run supabase:stop`

## Local Frontend With Hosted Supabase

Use this when you want to run the frontend locally while sharing rooms through a hosted Supabase project.

1. `npm.cmd install`
2. Create `.env` with:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-or-publishable-public-key>
```

3. `npm.cmd run dev`
4. Open `http://127.0.0.1:5173`.

`.env` is ignored. It may contain only browser-public configuration. Never put a service-role key, database password, access token, or provider API token there. GitHub secrets do not populate local files.

## Default Local URLs

Expected local URLs:

- app: `http://127.0.0.1:5173`
- Supabase API: `http://127.0.0.1:54321`
- Supabase Studio is intentionally disabled in the local config for now

## Next Docs

- Tests and local gates: [safeguards.md](safeguards.md)
- Hosted Supabase, GitHub Actions, and Cloudflare deploy: [../deployment/cloudflare-pages.md](../deployment/cloudflare-pages.md)
- Forking for your own instance: [../deployment/fork-setup.md](../deployment/fork-setup.md)
