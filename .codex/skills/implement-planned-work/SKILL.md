---
name: implement-planned-work
description: Implement a technical plan from chat, a file, a work item, an issue, a PR comment, or a prior planning-skill output. Use when Codex should execute planned work end to end in the current repo.
---

# Implement Planned Work

Primary lens: `Implementation`.

## Goal

Execute a provided plan end to end while following repo-local instructions, preserving scope, validating the result, and reviewing changed code before completion.

The plan is the source of truth. Repo rules still govern architecture, style, workflow, validation, commits, PRs, and tracker behavior.

## Resolve The Plan

Accept plans from inline chat, local files, tracker items, issues, PR comments, or `plan-implementation-work` output. Repo-local planning files live under `docs/backlog/<numbered-capability>/plans/` by default.

Use this decision path:

1. Inline: read the plan and identify goal, scope, acceptance, tasks, assumptions, leftovers, and final validation.
2. Plan file or name: read the given path; if only a title, slice ID, or tracker ID is given, look in the relevant `docs/backlog/<numbered-capability>/plans/` folder for the matching plan.
3. Tracker or issue: identify the system, inspect the referenced item with available connector/CLI, and determine whether it directly contains or links to the executable plan.
4. Parent story or bug: follow repo-local guidance to find the durable implementation task or child item; do not guess.
5. Access failure, missing plan, or ambiguous source: stop and ask one focused question or report the exact access blocker.

For `plan-implementation-work` output, map `Acceptance`, `Tasks`, `Assumptions`, `Review`, `Final Validation`, and `Leftovers` into the execution checklist.

## Workflow

1. Check the worktree.
   - Inspect git status before editing.
   - Read already-modified files that overlap the plan and work with those changes.
   - Only create branches, stage, commit, push, open PRs, or update/close tracker state when the user request or repo workflow explicitly calls for it.

2. Build the execution checklist.
   - Convert tasks into ordered steps.
   - Confirm dependencies, files/areas, validation, and out-of-scope work.
   - For architecture-shaping work, record the key standard choices before editing.
   - If final verification is missing or weak, derive validation from changed areas and repo testing guidance; choose the test layer explicitly instead of defaulting to unit or E2E by habit, and ask only when the validation choice changes risk.

3. Implement task by task.
   - Follow existing patterns before adding abstractions.
   - Keep edits scoped to the plan.
   - Add or update tests according to the plan and repo testing guidance, with integration tests as the default for slice behavior and E2E kept sparse.
   - Update docs only when the plan or repo rules require it.
   - Do not do unrelated cleanup or broad refactors.

4. Use subagents selectively.
   - Use implementation workers only for non-trivial plans with independent tasks and disjoint write scopes.
   - Do not spawn parallel writers for overlapping files or tightly coupled changes.
   - Tell workers they are not alone in the codebase and must not revert others' work.
   - After each worker, reconcile before continuing: inspect changed files, compare with owned scope, review the diff, record validation, and update the checklist before launching dependent work.
   - Use [references/subagent-handoffs.md](references/subagent-handoffs.md) for delegation rules and required handoff fields.

5. Validate continuously.
   - Run the cheapest meaningful checks for completed tasks.
   - Run final validation from the plan or synthesized fallback.
   - If the work will be pushed as code, do not treat a narrowed or partial validation run as sufficient final push validation unless the user explicitly waives it.
   - For user-visible UI behavior, run a concrete browser-validation flow before completion and capture evidence when the repo workflow expects it.
   - Do not mark UI work complete when integrated browser validation or expected evidence is missing unless the real user explicitly waives it; record the waiver or blocker.
   - If validation fails for in-scope reasons, fix and rerun the relevant check.
   - If validation cannot run, record exactly why and what remains unverified.

6. Review changed code after implementation, before completion.
   - Changed-code review against repo standards is mandatory for the full plan scope before completion.
   - When called inside `orchestrate-work-plan`, the orchestrator owns the final changed-code review, commit, backlog status, and workflow state; return implementation and validation results instead of starting a duplicate review loop.
   - Delegate this step to a review subagent and require that subagent to use the repo-local `review-changed-code` skill.
   - Spawn at most two review subagents for a single task. After two review passes, resolve any remaining findings yourself, record residual risk, and continue or stop instead of looping.
   - Require the reviewer to report against the repo review checklist, not only general principles.
   - Review the full plan diff and directly related context, not a whole-repo audit.
   - Use [references/subagent-handoffs.md](references/subagent-handoffs.md) for reviewer handoff requirements.
   - Wait for the review to complete, resolve blocking findings, record non-blocking findings or validation gaps, and rerun affected checks before completion.

7. Update durable state when applicable.
   - For tracker-backed plans, update progress at task boundaries.
   - For `orchestrate-work-plan`, leave backlog and workflow state updates to the orchestrator unless it explicitly delegates them.
   - Record completed task, files/areas changed, validation result, blockers, and remaining tasks.
   - Do not close/complete tracker work until all required tasks, acceptance criteria, review, and validation are complete.

## Completion Report

End with:

- tasks implemented
- files changed
- validation run and result
- review findings addressed or remaining
- skipped validation, manual verification, or residual risk
- branch, commit, PR, or tracker updates only when actually performed

Do not mark work complete if required tasks remain unfinished, review has blocking findings, or validation is blocked by an unresolved implementation issue.
