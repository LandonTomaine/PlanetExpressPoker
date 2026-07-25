---
name: plan-implementation-work
description: Turn a clear story, bug, feature, or repo change into a short implementation-ready task list. Use when planning is required before coding.
---

# Plan Implementation Work

Primary lens: `Implementation`.

## Workflow

1. Resolve outcome, constraints, non-goals, acceptance, and blocking ambiguity.
2. Inspect supplied requirements and the smallest relevant code/docs.
3. Identify affected files, boundaries, tests, and documentation.
4. Draft 3-7 ordered tasks. Include only details that prevent likely mistakes.
5. Choose test layers with `docs/development/testing/README.md`.
6. For UI work, name routes, states, and browser checks.
7. Present the draft in chat. Write it only after explicit approval.
   - Exception: `orchestrate-work-plan` may approve and write its planning result.

Blocking questions are a stop condition, not a plan section. Record only non-blocking assumptions.

## Plan Shape

- `# Plan: <title>`
- `Goal`
- `Scope`: in/out
- `Acceptance`
- `Assumptions`, only if needed
- `Tasks`
  - ID
  - action
  - files/areas
  - dependencies
  - parallel potential
  - validation
- `Review`
- `Final Validation`
- `Leftovers`, only if needed

Keep it to one screen when practical. Use concrete repo names and commands; avoid narrative and speculative internals.

Approved file path:

`docs/backlog/<capability>/plans/YYYY-MM-DD[-<id>]-short-title.md`
