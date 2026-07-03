# Cloudflare Pages Deployment

Planet Express Poker deploys as:

- Cloudflare Pages for the static React/Vite frontend.
- Hosted Supabase for Postgres, RPC functions, and realtime room updates.

Cloudflare Pages alone is not enough because the app needs Supabase for shared room state.

## GitHub + Cloudflare Pages

Use this for the normal hosted path.

1. Push `main` to GitHub.
2. In Cloudflare, create a Pages project connected to the GitHub repository.
3. Use these build settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Production branch: `main`
4. Add these Cloudflare Pages environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

Only use the public anon key in Cloudflare Pages. Never add the Supabase service-role key to this frontend project.

## Hosted Supabase

Create a Supabase project, then push the local migrations:

```powershell
npx.cmd supabase login
npx.cmd supabase link --project-ref <project-ref>
npx.cmd supabase db push
```

Copy the hosted Project URL and anon public key from Supabase into Cloudflare Pages.

## Direct Cloudflare Upload

This is useful before GitHub integration is finished.

1. Create `.env.production` locally with hosted Supabase values:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

2. Log in and deploy:

```powershell
npx.cmd wrangler login
npm.cmd run deploy:cloudflare
```

For direct uploads, Vite reads `.env.production` during the local build. Cloudflare runtime variables do not rewrite already-built static assets.
