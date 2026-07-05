---
name: complete-pr
description: Complete a GitHub pull request for this repo after the user asks to push, ship, create a PR, or finish a PR. Use when Codex should push a branch, open or update a PR, poll required GitHub checks and Codex GitHub review, address worthwhile review issues, and stop instead of merging after more than two review fix loops.
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
4. Poll required checks and Codex GitHub review to terminal state.
5. Inspect Codex GitHub review for actionable issues.
6. Resolve worthwhile issues: correctness, security, maintainability, repo standards.
7. Push fixes; poll again; count each fix-review cycle.
8. Stop if Codex GitHub review still has actionable issues after two cycles.
9. Merge only when checks pass, review is satisfied, and Codex GitHub review has no actionable issue.

Do not treat Codex review summaries, connector metadata, or non-actionable notes as blockers.

## Handoff

Report the PR URL, check state, Codex review state, fix-loop count, merge state, and any unresolved issue.
