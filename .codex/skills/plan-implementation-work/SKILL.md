---
name: plan-implementation-work
description: Plan a user story, bug, task, feature, repo change, or implementation request before coding. Use when Codex should clarify ambiguity, inspect relevant repo context, and produce an implementation-ready task list.
---

# Plan Implementation Work

Primary lens: `Implementation`.

## Goal

Ask until the work has no material ambiguity, then produce a short implementation plan as a flat task list another implementer can execute without hidden context.

Blocking questions are a stop condition, not a plan section.

## Workflow

1. Clarify the work.
   - Identify the requested outcome, constraints, non-goals, and acceptance criteria.
   - If the user is still choosing the architecture direction, answer that first.
   - Ask until no material ambiguity remains.
   - Record only non-blocking assumptions.

2. Inspect enough code to plan accurately.
   - Use supplied PRD/backlog/artifacts before loading extra docs.
   - Read nearby patterns for each affected area.
   - Use targeted searches and file reads; do not broad-scan by default.
   - Identify likely files, modules, handlers, pages, services, tests, and docs.
   - Treat repo docs, local code, and architecture tests as the source of truth.

3. Produce tasks, not prose.
   - Break the work into small, ordered tasks.
   - Prefer 3-7 tasks unless the work clearly needs more.
   - Keep each task terse and concrete.
   - Include: ID, action, files/areas, depends_on, parallel, validation.

4. Add technical detail only when it prevents a likely mistake.
   - Prefer file names, handler names, query names, error types, and exact commands.
   - Use short notes only for high-risk decisions or intentional leftovers.

5. Define completion.
   - Provide exact validation commands when available.
   - When tests are part of the change, name the intended test layer explicitly using `docs/development/testing/strategy.md` rather than saying only `add tests`.
   - For UI work, name routes/pages/components, states, copy/consequence, and browser scope.
   - For new/changed main workflows, state feature-close E2E coverage. Do not add per-slice E2E unless risk demands it.
   - Provide brief manual checks only when automation is insufficient.
   - State assumptions and leftovers briefly.

6. Present the draft plan for approval before writing it anywhere.
   - Paste the draft plan into chat first.
   - Require explicit approval before writing any durable plan file.
   - When called by `orchestrate-work-plan`, return the draft and recommended path; the orchestrator may approve and write it under its own rules.
   - If the user requests changes, revise in chat and ask again.

## Output Rules

- Before approval, return the draft plan in chat and do not write a file.
- After explicit approval, write the plan under the relevant capability folder: `docs/backlog/<numbered-capability>/plans/YYYY-MM-DD-short-title.md`.
- If a tracker or slice ID exists, use `docs/backlog/<numbered-capability>/plans/YYYY-MM-DD-<id>-short-title.md`.
- After writing the approved plan, return the plan path in the response.
- Optimize for brevity. The plan should usually fit on one screen.
- Use bullets and short lines, not explanatory paragraphs.
- Do not include sections that would be empty.
- Do not include an `Open Questions` section in a completed plan.
- Do not create long narratives or handoff prose.
- Use this shape:
  - `# Plan: <short title>`
  - `Goal: <one sentence>`
  - `Scope:` with `In` and `Out`
  - `Acceptance`
  - `Assumptions` if needed
  - `Tasks` with `[Tn]`, `Files/Areas`, `Depends on`, `Parallel`, `Validation`
  - `Review`
  - `Final Validation`
  - `Leftovers` if needed

## Quality Bar

- Keep the plan short enough to skim quickly.
- Prefer individual tasks over grouped modules.
- Make dependencies explicit.
- Mention parallel potential only when it is real.
- Use concrete repo names when known.
- Do not over-plan internals that should be discovered during implementation.
- Store implementation plans under `docs/backlog/<numbered-capability>/plans/` unless the user explicitly names another destination.
