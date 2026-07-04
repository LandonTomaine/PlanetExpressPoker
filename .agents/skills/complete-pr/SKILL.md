---
name: complete-pr
description: Complete a GitHub pull request for this repo after the user asks to push, ship, create a PR, or finish a PR. Use when Codex should push a branch, open or update a PR, poll required GitHub checks and CodeRabbit, address worthwhile review issues, and stop instead of merging after more than two CodeRabbit fix loops.
---

# Complete PR

Primary lens: `Implementation`.

## Load First

- `docs/development/pull-requests.md`
- `docs/development/safeguards.md`

## Workflow

1. Confirm branch is not `main`.
2. Run or confirm relevant local validation.
3. Push branch; open or update PR.
4. Poll required checks and CodeRabbit to terminal state.
5. Inspect CodeRabbit for actionable issues.
6. Resolve worthwhile issues: correctness, security, maintainability, repo standards.
7. Push fixes; poll again; count each fix-review cycle.
8. Stop if CodeRabbit still has actionable issues after two cycles.
9. Merge only when checks pass, review is satisfied, and CodeRabbit has no actionable issue.

Do not treat CodeRabbit summaries, walkthroughs, or non-actionable notes as blockers.

## Handoff

Report the PR URL, check state, CodeRabbit state, fix-loop count, merge state, and any unresolved issue.
