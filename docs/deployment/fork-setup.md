# Fork Setup

Use this checklist to run your own copy of Planet Express Poker with your own Supabase, Cloudflare, and GitHub Actions resources.

## 1. Fork And Clone

1. Fork the repository on GitHub.

2. Clone your fork:

```powershell
git clone https://github.com/<your-user>/<your-repo>.git
cd <your-repo>
npm.cmd install
```

3. Confirm local validation works:

```powershell
npm.cmd run format:check
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run test:integration
npm.cmd run test:architecture
npm.cmd run build
```

For purely local development, you can stop here and use either:

- local Supabase via [../development/getting-started.md](../development/getting-started.md)
- hosted Supabase from your own project, also documented there

## 2. Create Supabase Resources

1. Create a Supabase project.
2. Save the project ref, database password, project URL, and anon or publishable public key.
3. Link the local repo to the hosted project and push migrations:

```powershell
$env:SUPABASE_ACCESS_TOKEN="<supabase-access-token>"
$env:SUPABASE_DB_PASSWORD="<database-password>"
npx.cmd supabase link --project-ref <project-ref>
npx.cmd supabase db push
```

4. Create `.env` for local development:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-or-publishable-public-key>
```

Only use the Supabase anon or publishable public key in frontend config. Never use the service-role key in this app.

## 3. Create Cloudflare Resources

1. Create a Cloudflare Pages project.
2. Choose a project name.
3. Create a Cloudflare API token that can deploy Cloudflare Pages.
4. Save your Cloudflare account ID.

If your project name is not `planet-express-poker`, update:

- `wrangler.jsonc`
- `package.json` script `deploy:cloudflare`
- `.github/workflows/deploy-cloudflare.yml`

If the footer repo link ever points at the upstream repository during a manual/local build, set `PEP_REPOSITORY_URL=https://github.com/<your-user>/<your-repo>` before building. GitHub Actions and normal git clones resolve the fork URL automatically.

## 4. Update The Deploy Guard

The deploy workflow is intentionally guarded so forks cannot deploy to the original repository resources.

In `.github/workflows/deploy-cloudflare.yml`, replace:

```text
LandonTomaine/PlanetExpressPoker
```

with:

```text
<your-user>/<your-repo>
```

## 5. Add GitHub Secrets

Add these repository secrets to your fork:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
SUPABASE_ACCESS_TOKEN
SUPABASE_DB_PASSWORD
SUPABASE_PROJECT_REF
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Use hosted Supabase values for `VITE_SUPABASE_*`, not local Supabase values. The deploy workflow also uses `SUPABASE_*` to apply migrations before deploying the frontend.

## 6. Optional Codex Reviews

This repository uses the ChatGPT/Codex GitHub connector for pull request review.

Codex reviews are optional for forks. To enable them for your fork:

1. Connect GitHub from ChatGPT or Codex settings.
2. Authorize the ChatGPT/Codex GitHub app for your forked repository.
3. Enable automatic pull request reviews for the fork if desired.
4. Confirm `chatgpt-codex-connector` reviews appear on new pull requests, or request one with `@codex review`.

## 7. Open A Pull Request And Deploy

Commit fork-specific config changes on a branch:

```powershell
git switch -c configure-hosting
git add .
git commit -m "Configure fork hosting"
git push -u origin configure-hosting
```

Open a pull request into `main`. After required checks pass and the PR is merged, GitHub Actions will deploy to Cloudflare Pages if the deploy guard, secrets, and Cloudflare project are configured correctly.

The deploy workflow will also run `supabase db push` against your hosted project before the frontend upload.

## 8. Smoke Test

After deployment:

- open the Cloudflare Pages production URL
- create or join a room
- join from a second browser or device
- vote, reveal, and start a next round

For more detail, use [cloudflare-pages.md](cloudflare-pages.md).
