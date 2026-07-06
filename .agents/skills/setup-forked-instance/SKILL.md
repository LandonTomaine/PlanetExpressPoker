---
name: setup-forked-instance
description: Help a fork owner configure Planet Express Poker for their own local and deployed instance, including Supabase, Cloudflare Pages, GitHub Actions secrets, the deploy guard, and repository metadata.
---

# Setup Forked Instance

Primary lens: `Implementation`.

## Goal

Take a fork from clone to a working local instance and an independently deployable hosted instance without leaking upstream repository settings or secrets.

## Authoritative Sources

Use these before making fork-specific edits:

- `docs/development/getting-started.md`
- `docs/deployment/fork-setup.md`
- `docs/deployment/cloudflare-pages.md`
- `.github/workflows/deploy-cloudflare.yml`
- `vite.config.ts`

## Workflow

1. Confirm the target setup path.
   - Determine whether the user wants local-only setup, hosted Supabase, Cloudflare deployment, or the full path.
   - Ask only if that choice changes what files or secrets must be edited.

2. Set up local development first.
   - Install dependencies.
   - Configure `.env` for either local Supabase or the fork owner's hosted Supabase project.
   - Use the docs above instead of restating command details from memory.

3. Configure hosted Supabase.
   - Capture project ref, database password, project URL, anon or publishable key, and access token.
   - Link the CLI to the hosted project and run `supabase db push`.
   - Never put the service-role key in frontend config, GitHub secrets, or Cloudflare settings.

4. Configure Cloudflare Pages and GitHub Actions.
   - Create the Cloudflare Pages project and API token.
   - Add the required GitHub repository secrets.
   - Update the deploy guard in `.github/workflows/deploy-cloudflare.yml`.
   - If the fork uses a different Cloudflare Pages project name, update `wrangler.jsonc`, `package.json`, and `.github/workflows/deploy-cloudflare.yml`.

5. Check fork-owned repository metadata.
   - Make sure app footer/build metadata points at the fork instead of the upstream repository.
   - Prefer automatic resolution from GitHub Actions or `git remote origin`.
   - For unusual manual builds outside a normal git clone, use `PEP_REPOSITORY_URL`.

6. Validate the fork setup.
   - Run the narrowest meaningful local validation first.
   - Before a hosted deploy, confirm required secrets exist and the deploy guard targets the fork.
   - After deployment, smoke test room create/join, voting, reveal, and next-round flow.

## Routing Notes

- Use this skill when a user asks to set up their own local/deployed instance from a fork.
- Do not use it for generic documentation audits or unrelated app deployment work.
- If the user only wants repository hosting docs updated, edit the authoritative docs directly instead of using this as a broad workflow wrapper.
