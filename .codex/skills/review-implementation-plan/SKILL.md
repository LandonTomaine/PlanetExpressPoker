---
name: review-implementation-plan
description: Review an implementation plan before coding for slice scope, MVP simplicity, architecture choices, validation, UI coverage, integration boundaries, task order, and unresolved ambiguity. Use as a plan review gate after planning and before implementation.
---

# Review Implementation Plan

Primary lens: `Review`.

## Goal

Catch bad implementation plans before code is written.

## Workflow

1. Read the implementation plan.
2. Read the source PRD/backlog slice.
3. Load only needed standards docs for affected areas.
4. Return findings only; do not edit.

## Checks

- Plan stays inside one slice and does not implement future capability work.
- Tasks are concrete, ordered, dependency-aware, and small enough to validate.
- Architecture choices are explicit when relevant:
  - local pattern A vs local pattern B
  - shared abstraction vs direct implementation
  - reusable component vs local implementation
  - test layer choice
- Tests match repo strategy; integration tests are preferred for slice behavior, E2E stays sparse.
- UI changes include a concrete browser-validation plan when user-visible behavior changed.
- UI plans list changed routes/pages/components.
- UI plans include states: first-time, edit, empty, loading, error, disabled, success, blocked.
- Copy terms and consequence messaging are decided before coding.
- Browser validation names viewports, interactions, artifacts, and console/error checks.
- New or changed main workflows state a concrete final validation path; browser E2E is optional unless the repo has adopted it.
- Foreground validation commands have bounded timeouts.
- No unresolved product, UX, data, architecture, or validation ambiguity remains.

## Output

Use:

- `[high|medium|low] file:line - finding`
- `Why it matters: <short impact>`
- `Suggested fix: <concise wording/rule>`
- `Blocking: yes|no`

`[high]` means wrong scope, wrong architecture direction, missing validation, missing UI state plan, or unresolved blocking ambiguity.
`[medium]` means weak task order, vague tests, vague UX/browser coverage, risky assumptions, or likely overbuild.
`[low]` means minor plan clarity cleanup.

If clean, say so and name the validation that should prove completion.
