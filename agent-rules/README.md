# Agent Rules

This folder is the agent entrypoint for the repository.

The goal is just-enough-context: load what is needed for the current task, then stop.

Most durable guidance belongs in shared docs under `docs/`. This folder is only for agent behavior and routing.

## Always Load

Read this at the start of every task:

- [core.md](core.md)

## Principles

- Use this index for routing, not as a checklist.
- Do not read every file linked from this index.
- Load the smallest set that can answer the current task.

## Repo-Local Skills

Repo-local skills live under `.agents/skills/`.

Use a repo-local skill only when the task clearly matches it.

## Load Only When Needed

Use these routes only when the task actually needs them:

- Shell and PowerShell command behavior in this environment:
  - [shell.md](shell.md)
- Architecture changes or boundary questions:
  - [../docs/architecture/overview.md](../docs/architecture/overview.md)
- General product context:
  - [../docs/product/overview.md](../docs/product/overview.md)
- Product vocabulary or domain terms:
  - [../docs/product/ubiquitous-language.md](../docs/product/ubiquitous-language.md)
- Product modeling concepts:
  - [../docs/product/domain-concepts.md](../docs/product/domain-concepts.md)
- Persona or user-context questions:
  - [../docs/product/personas.md](../docs/product/personas.md)
- Current product requirements:
  - [../docs/product/requirements/README.md](../docs/product/requirements/README.md)
- Delivery tracking or backlog planning:
  - [../docs/backlog/README.md](../docs/backlog/README.md)
- Product workflow questions:
  - [../docs/product/workflows.md](../docs/product/workflows.md)
- Engineering standards and setup:
  - [../docs/development/README.md](../docs/development/README.md)
- Pull request standards:
  - [../docs/development/pull-requests.md](../docs/development/pull-requests.md)
- Documentation maintenance:
  - [../docs/development/documentation.md](../docs/development/documentation.md)
- Deployment or hosting questions:
  - [../docs/deployment/cloudflare-pages.md](../docs/deployment/cloudflare-pages.md)
- Maintaining this guidance system:
  - [maintaining.md](maintaining.md)

## Workflow

- After loading the minimum relevant docs, inspect the specific code and tests you are about to change.
- Treat docs as guidance and local code as the source of truth when they disagree.
- If a task spans multiple areas, load only the union of the relevant docs instead of reading everything.
