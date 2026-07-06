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

## PowerShell Note

On this machine, PowerShell may block `npm` and `npx` PowerShell shims because of execution policy.

If that happens:

- use `npm.cmd` instead of `npm`
- use `npx.cmd` instead of `npx`

The package scripts themselves still use normal `npm run ...` flows.

## Local Frontend With Local Supabase

1. Install frontend and repo tooling dependencies
   - `npm install`
2. Copy environment defaults
   - `.env.example` -> `.env`
3. Start the local Supabase stack
   - `npm run supabase:start`
4. Check local Supabase connection info
   - `npm run supabase:status`
5. Copy the displayed local publishable or anon public key into `.env` as `VITE_SUPABASE_ANON_KEY`.
6. Start the frontend
   - `npm run dev`
7. Open the app
   - `http://127.0.0.1:5173`

Stop local Supabase when finished:

- `npm run supabase:stop`

## Local Frontend With Hosted Supabase

Use this when you want to run the frontend locally while sharing rooms through a hosted Supabase project.

1. Install dependencies
   - `npm install`
2. Create `.env`
   - set `VITE_SUPABASE_URL=https://<project-ref>.supabase.co`
   - set `VITE_SUPABASE_ANON_KEY=<anon-or-publishable-public-key>`
3. Start the frontend
   - `npm run dev`
4. Open the app
   - `http://127.0.0.1:5173`

GitHub repository secrets do not populate your local shell or `.env`. Local development always needs local environment values.

## Default Local URLs

Expected local URLs:

- app: `http://127.0.0.1:5173`
- Supabase API: `http://127.0.0.1:54321`
- Supabase Studio is intentionally disabled in the local config for now

## Default Validation

- format check: `npm run format:check`
- lint: `npm run lint`
- typecheck: `npm run typecheck`
- unit tests: `npm run test:unit`
- integration tests: `npm run test:integration`
- architecture checks: `npm run test:architecture`
- build: `npm run build`
- E2E smoke, with `.env` pointed at local or hosted Supabase: `npm run test:e2e`

## Next Docs

- Hosted Supabase, GitHub Actions, and Cloudflare deploy: [../deployment/cloudflare-pages.md](../deployment/cloudflare-pages.md)
- Forking for your own instance: [../deployment/fork-setup.md](../deployment/fork-setup.md)
