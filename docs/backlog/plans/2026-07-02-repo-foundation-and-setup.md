# Plan: Repo Foundation And Setup

Goal: take the repository from product/docs-only into a ready-to-build local-first codebase with standards, tooling, hooks, and repo-local skills aligned to the chosen stack.

## Scope

In:

- repository standards and workflow docs
- local app scaffold
- local Supabase development setup
- linting, formatting, typecheck, and build commands
- Husky git hooks
- repo-local skill cleanup tied to the real stack

Out:

- full application implementation
- production deployment
- advanced CI/CD
- later product slices beyond repo foundation

## Acceptance

- Shared development docs match the chosen stack and local workflow.
- The repo can be scaffolded and run locally against Supabase.
- Linting, typecheck, and build commands exist and are documented.
- Git hooks enforce the intended local quality gate.
- Repo-local skills no longer depend on the old source repo's assumptions.

## Tasks

- [T1] Finalize repository docs and standards
  - Files/Areas: `docs/development/*`, `docs/product/domain-concepts.md`, `docs/architecture/*` as needed
  - Depends on: none
  - Parallel: yes
  - Validation: docs are consistent with PRD and architecture docs

- [T2] Scaffold the frontend application
  - Files/Areas: root app scaffold, `src/`, `package.json`, TypeScript and Vite config
  - Depends on: T1
  - Parallel: no
  - Validation: app installs, runs locally, and builds

- [T3] Add core frontend stack and environment wiring
  - Files/Areas: routing, Tailwind, Motion, environment handling, Supabase client setup
  - Depends on: T2
  - Parallel: limited
  - Validation: app renders locally and can target local Supabase configuration

- [T4] Add local Supabase development setup
  - Files/Areas: local setup docs, env example files, Supabase config
  - Depends on: T2
  - Parallel: limited
  - Validation: local backend services can be started and reached by the app

- [T5] Add repo tooling and hooks
  - Files/Areas: lint/format/typecheck/build config, `.husky/`, tooling docs
  - Depends on: T2
  - Parallel: limited
  - Validation: hooks fail on broken lint/typecheck/build and pass on a clean repo

- [T6] Rewrite repo-local skills against the real stack
  - Files/Areas: `.agents/skills/*`
  - Depends on: T1, T3, T5
  - Parallel: no
  - Validation: skills reference real commands, folders, and validation flow

- [T7] Define the initial schema and first implementation slice
  - Files/Areas: schema docs, backlog docs, first implementation plan
  - Depends on: T1, T3, T4
  - Parallel: no
  - Validation: enough detail exists to begin building room creation, join, and realtime presence

## Review

- Keep the repo lightweight and local-first.
- Avoid importing process complexity from the reference repo unless it clearly helps this project.
- Favor explicit commands and small docs over broad generic guidance.

## Final Validation

- Development docs match the chosen stack.
- Local setup steps are coherent.
- Repo plan remains aligned with the PRD and architecture docs.
