# Cloudflare Pages Deployment

Planet Express Poker deploys as:

- Cloudflare Pages for the static React/Vite frontend.
- Hosted Supabase for Postgres, RPC functions, and realtime room updates.

Cloudflare Pages alone is not enough because the app needs Supabase for shared room state.

If you are deploying a fork with your own Cloudflare and Supabase resources, start with [fork-setup.md](fork-setup.md).

## GitHub Actions + Cloudflare Pages

Use this for the normal hosted path.

The repo deploys to Cloudflare Pages from GitHub Actions on every push to `main`.

Required GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Only use the Supabase anon/publishable public key. Never add the Supabase secret or service-role key to GitHub or Cloudflare for this frontend.

Cloudflare project settings:

- Project name: `planet-express-poker`
- Production URL: `https://planet-express-poker.pages.dev`
- Build output directory: `dist`

If deploying your own fork under another project name, update:

- `wrangler.jsonc`
- `package.json` script `deploy:cloudflare`
- `.github/workflows/deploy-cloudflare.yml`

The deploy workflow is guarded to run only in `LandonTomaine/PlanetExpressPoker`. Forks must update that guard before deploying to their own resources.

Before making the repo public, protect the GitHub `production` environment and require manual deployment approval if the repository plan supports environment reviewers.

## Optional Cloudflare Git Integration

Cloudflare Pages can also connect directly to GitHub through the Cloudflare dashboard, but this repo uses GitHub Actions instead so the build and deploy steps are explicit in source control.

If switching to Cloudflare's dashboard Git integration later, use:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Hosted Supabase

Create a hosted Supabase project, then push the local migrations.

Required values from Supabase:

- Project ref
- Database password
- Project URL
- Anon or publishable public key
- Personal access token for CLI automation

```powershell
$env:SUPABASE_ACCESS_TOKEN="<supabase-access-token>"
$env:SUPABASE_DB_PASSWORD="<database-password>"
npx.cmd supabase link --project-ref <project-ref>
npx.cmd supabase db push
```

Copy the hosted Project URL and anon/publishable public key into GitHub repository secrets as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Direct Cloudflare Upload

This is useful before GitHub integration is finished.

1. Create `.env.production` locally with hosted Supabase values:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-or-publishable-public-key>
```

2. Log in and deploy:

```powershell
npx.cmd wrangler login
npm.cmd run deploy:cloudflare
```

For direct uploads, Vite reads `.env.production` during the local build. Cloudflare runtime variables do not rewrite already-built static assets.
