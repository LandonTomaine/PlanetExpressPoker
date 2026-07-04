# Getting Started

This repository uses:

- `Node.js`
- `React`
- `TypeScript`
- `Vite`
- `Supabase`

## Prerequisites

- Node.js `24.x` is the current known-good local version in this repo
- Docker Desktop for the local Supabase stack

## PowerShell Note

On this machine, PowerShell may block `npm` and `npx` PowerShell shims because of execution policy.

If that happens:

- use `npm.cmd` instead of `npm`
- use `npx.cmd` instead of `npx`

The package scripts themselves still use normal `npm run ...` flows.

## Local Setup

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

## Default Local URLs

Expected local URLs:

- app: `http://127.0.0.1:5173`
- Supabase API: `http://127.0.0.1:54321`
- Supabase Studio is intentionally disabled in the local config for now

## Default Validation

- lint: `npm run lint`
- typecheck: `npm run typecheck`
- unit tests: `npm run test:unit`
- architecture checks: `npm run test:architecture`
- build: `npm run build`
- E2E smoke, with `.env` pointed at local or hosted Supabase: `npm run test:e2e`
