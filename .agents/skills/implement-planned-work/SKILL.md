---
name: implement-planned-work
description: Implement an approved technical plan from chat, a file, tracker item, issue, PR comment, or planning-skill output. Use for scoped end-to-end implementation and validation.
---

# Implement Planned Work

Primary lens: `Implementation`.

## Resolve

Identify the plan's goal, scope, acceptance, tasks, assumptions, validation, and leftovers.

- File/name: resolve it under the relevant capability `plans/` folder.
- Tracker/issue/PR: inspect the referenced item and linked plan.
- Missing, inaccessible, or ambiguous source: stop with one focused question or exact blocker.

## Execute

1. Inspect branch, status, and overlapping changes.
2. Turn the plan into an ordered checklist with dependencies and validation.
3. Record architecture choices when the work changes boundaries.
4. Implement task by task:
   - follow current patterns
   - stay inside plan scope
   - add tests at the cheapest sufficient layer
   - update docs only when behavior or repo rules require it
5. Use workers only for independent, disjoint tasks. Reconcile every worker diff before dependent work.
6. Validate continuously, then run the plan's final checks.
   - Fix in-scope failures and rerun.
   - Browser-check user-visible UI.
   - Record any unavailable check, blocker, or explicit waiver.
7. Review the full plan diff with `review-changed-code`.
   - Use at most two fix/review cycles.
   - When called by `orchestrate-work-plan`, return results; the orchestrator owns final review, commit, and workflow state.
8. Update tracker or workflow state only when applicable and authorized.

Use [references/subagent-handoffs.md](references/subagent-handoffs.md) when delegating. Do not mark work complete with unfinished tasks, blocking findings, or unresolved validation failures.

## Report

- implemented tasks and changed areas
- validation and UI evidence
- review findings resolved or remaining
- skipped checks or residual risk
- branch, commit, PR, or tracker changes only when performed
