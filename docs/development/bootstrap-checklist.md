# Bootstrap Checklist

Status: current
Last updated: 2026-07-04

This tracks repository standards/bootstrap coverage. Keep standards follow-up here unless it becomes product backlog work.

| Area                            | Status   | Evidence                                                                                                          | Decision / Next Step                                                                        |
| ------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Purpose and stack               | Present  | `README.md`, `docs/product/overview.md`                                                                           | Keep current with product and stack changes.                                                |
| Agent entrypoint                | Present  | `AGENTS.md`, `agent-rules/README.md`, `agent-rules/core.md`                                                       | Keep `AGENTS.md` minimal and route through `agent-rules/`.                                  |
| Repo-local skills               | Present  | `.agents/skills/README.md`                                                                                        | New repo-local skills live under `.agents/skills/`.                                         |
| Local setup/run                 | Present  | `README.md`, `docs/development/getting-started.md`                                                                | Keep environment and Supabase setup instructions current.                                   |
| Deployment/release              | Present  | `docs/deployment/cloudflare-pages.md`, `docs/deployment/fork-setup.md`, `.github/workflows/deploy-cloudflare.yml` | Keep Cloudflare and Supabase secret names current.                                          |
| Documentation maintenance       | Present  | `docs/development/documentation.md`                                                                               | Update docs with behavior, command, deployment, validation, or standards changes.           |
| Product docs                    | Present  | `docs/product/README.md`, `docs/product/requirements/00-product-prd.md`                                           | Product behavior changes should update relevant product docs.                               |
| Architecture docs               | Present  | `docs/architecture/overview.md`, `docs/architecture/data-model.md`                                                | Architecture boundary changes require doc updates.                                          |
| Development standards           | Present  | `docs/development/README.md`, `backend.md`, `frontend.md`, `workflow.md`, `tooling.md`                            | Keep command docs aligned with package scripts and hooks.                                   |
| Test strategy                   | Present  | `docs/development/testing/strategy.md`, `docs/development/testing/playwright-e2e.md`                              | Keep test layers and E2E scope current.                                                     |
| Local quality gates             | Present  | `.husky/pre-commit`, `.husky/pre-push`, `package.json`, `docs/development/safeguards.md`                          | Pre-push runs lint, typecheck, unit, integration, architecture, and build checks.           |
| CI                              | Present  | `.github/workflows/ci.yml`                                                                                        | CI mirrors format, lint, typecheck, unit, integration, architecture, build, and E2E checks. |
| Security/public readiness       | Present  | `scripts/check-public-readiness.mjs`, `.github/workflows/codeql.yml`, `.gitignore`, `README.md`, `SECURITY.md`    | Keep secret, workflow, path, CodeQL, and boundary checks current.                           |
| Licensing and contribution docs | Present  | `LICENSE.md`, `ASSET_NOTICES.md`, `CONTRIBUTING.md`                                                               | Code is MIT; bundled themed assets are excluded and non-commercial.                         |
| Dependency hygiene              | Present  | `package-lock.json`, `.github/dependabot.yml`, `npm audit` command in `README.md`                                 | Run `npm audit --audit-level=moderate` before push and review Dependabot manually.          |
| Deployed validation             | Partial  | `docs/deployment/cloudflare-pages.md`                                                                             | Add explicit post-deploy smoke steps if deployment validation becomes repetitive.           |
| Python-backed bootstrap scripts | Deferred | Bootstrap skill scripts; local Python unavailable                                                                 | Install Python or keep the manual fallback for future bootstrap script use.                 |
