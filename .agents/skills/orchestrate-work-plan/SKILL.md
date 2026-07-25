---
name: orchestrate-work-plan
description: Run a child PRD, backlog, implementation plan, or workflow state file through planning, implementation, validation, review, commits, and safe resume. Use for explicit multi-slice or resumable delivery requests.
---

# Orchestrate Work Plan

Primary lens: `Implementation`; use `Product/PRD` or `Review` at matching gates.

Flow:

`child PRD -> backlog -> slice plan -> implementation -> validation -> review -> commit`

Work one slice at a time unless tasks are independent with disjoint writes.

## Source

- Child PRD: create/revise its capability backlog with `draft-backlog-slices`, then review it.
- Backlog: select the next unblocked slice and plan it.
- Implementation plan: execute with `implement-planned-work`.
- Workflow state: resume from it before selecting work.

Default paths:

- Backlog: `docs/backlog/<capability>/backlog.md`
- Plans: `docs/backlog/<capability>/plans/`
- Workflow: `docs/backlog/<capability>/workflows/YYYY-MM-DD-short-title.md`

## Preconditions

1. Inspect branch, status, and recent commits.
2. Stop on overlapping unrelated changes unless the user included them.
3. Work on a purpose-named branch, not `main`.
4. Report unpushed baseline commits when remote-backed progress is expected.

## Queue

1. Resolve the source. Stop on missing access or unresolved identity.
2. Preserve existing requirement/slice IDs.
3. Split work until each item can be implemented, validated, reviewed, and committed alone.
4. Record dependencies and blocking user decisions.
5. For each slice:
   - use `plan-implementation-work`
   - save the approved plan
   - mark the slice `planned`
6. Create durable state with [references/workflow-state.md](references/workflow-state.md).

Do not guess product, UX, architecture, data, scope, or validation decisions. Continue around a blocked item only when another item is independent.

## Execute

For each ready item:

1. Mark the workflow task and backlog slice `in_progress`.
2. Hand the task, acceptance, scope, dependencies, and validation to `implement-planned-work`.
3. Inspect the resulting diff.
4. Run focused checks, then the plan's final validation.
5. Browser-check user-visible UI. Record a user waiver or blocker if that cannot run.
6. Review with `review-changed-code`; use at most two fix/review cycles.
7. Record status, files, validation, UI evidence, review result, and residual risk.
8. Mark the backlog slice `done` or `blocked`.
9. Commit the completed item. Push when requested or when the branch already tracks a remote.

Use [references/handoffs.md](references/handoffs.md) for review and planning handoffs. Use bounded validation; do not run writers against the same cache, database, or generated output in parallel.

## Stop

Stop and update workflow state when:

- changes overlap unrelated dirty work
- all remaining work needs user input
- validation still fails after a focused fix
- completing the item would broaden its scope
- commit state is unsafe
- workflow state and Git disagree

## Resume And Complete

Resume with [references/workflow-state.md](references/workflow-state.md): reconcile it with branch, status, and recent commits, then continue the next ready item.

Complete only when every item is `done` or explicitly `skipped`. Report workflow/backlog/plan paths, completed IDs, commits, validation, skipped or blocked work, and push state.
