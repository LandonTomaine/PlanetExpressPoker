# Documentation Maintenance

Documentation is part of the change when behavior, commands, setup, deployment, validation, architecture, schema, or standards change.

## Authoritative Docs

- Product truth: `docs/product/`
- Architecture and data boundaries: `docs/architecture/`
- Setup, tooling, workflow, and validation: `docs/development/`
- Deployment: `docs/deployment/cloudflare-pages.md`
- Agent routing only: `AGENTS.md` and `agent-rules/`

## Update Triggers

- Product, UI workflow, or terminology changes require the relevant product docs.
- Supabase schema, RPC, realtime, or persistence changes require architecture/backend docs when behavior changes.
- Commands, scripts, hooks, CI, dependencies, or environment variables require README and development docs updates.
- Deployment, secret, or provider changes require deployment docs and README deploy sections.
- Validation changes require the testing docs.
- Repo-local skill or routing changes require `agent-rules/README.md` and `.agents/skills/README.md`.

## Rules

- Prefer targeted updates over broad rewrites.
- Do not duplicate policy; route to the authoritative file.
- Historical plans can stay historical unless current indexes route to them as active guidance.
- If docs and code disagree, trust code/tests first, then update docs.
- Mention skipped docs updates or documentation uncertainty in the final handoff.
