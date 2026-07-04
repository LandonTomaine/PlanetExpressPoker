---
name: complete-pr
description: Complete a GitHub pull request for this repo after the user asks to push, ship, create a PR, or finish a PR. Use when Codex should push a branch, open or update a PR, poll required GitHub checks and CodeRabbit, address worthwhile review issues, and stop instead of merging after more than two CodeRabbit fix loops.
---

# Complete PR

Primary lens: `Implementation`.

## Goal

Finish a branch through the repo's PR path without bypassing review gates.

## Load First

- `docs/development/pull-requests.md`
- `docs/development/safeguards.md`

## Workflow

1. Confirm the branch is not `main`.
2. Run or confirm the relevant local validation before pushing.
3. Push the branch and open or update the PR.
4. Poll required GitHub checks and CodeRabbit until they reach a terminal state.
5. Inspect CodeRabbit comments, review findings, and status output for actionable issues.
6. Resolve worthwhile issues based on correctness, security, maintainability, and repo standards.
7. Push fixes and poll again, counting each fix-and-review cycle.
8. Stop and report if CodeRabbit still has actionable issues after two cycles.
9. Merge only when required checks pass, required review is satisfied, and no actionable CodeRabbit issue remains.

Do not treat CodeRabbit summaries, walkthroughs, or non-actionable notes as blockers.

## Handoff

Report the PR URL, check state, CodeRabbit state, fix-loop count, merge state, and any unresolved issue.
