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
2. Copy environment defaults if needed
   - `.env.example` -> `.env`
3. Start the local Supabase stack
   - `npm run supabase:start`
4. The repo-local `.env` already targets the working local API URL and anon key.
5. Check local Supabase connection info if needed
   - `npm run supabase:status`
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
- build: `npm run build`
