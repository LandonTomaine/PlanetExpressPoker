---
name: review-backlog-slices
description: Review a capability backlog for PRD traceability, MVP scope control, slice size, dependencies, validation expectations, handoff clarity, and no hidden implementation design. Use as a backlog review gate before implementation planning.
---

# Review Backlog Slices

Primary lens: `Product/PRD`.

## Goal

Ensure the backlog can drive small, safe implementation plans without scope drift.

## Workflow

1. Read the source child PRD.
2. Read the capability `backlog.md`.
3. Read `docs/backlog/README.md` and one nearby backlog for shape only when needed.
4. Return findings only; do not edit.

## Checks

- Every slice traces to the PRD; no later MVP capabilities are added.
- Slices are small enough to plan, implement, validate, review, and commit independently.
- Dependencies are explicit; ordering is not hidden in prose.
- Backlog stays delivery-facing: no handlers, schema, CSS, or component design.
- Acceptance and validation are concrete, including UI/browser validation when user-visible.
- User-visible slices include UX acceptance, state coverage, and browser scope.
- New/changed main user workflows have feature-close E2E coverage.
- MVP simplicity is protected; no automation, settings, roles, reports, or integrations beyond scope.
- Handoff tells the next agent what to plan next.

## Output

Use:

- `[high|medium|low] file:line - finding`
- `Why it matters: <short impact>`
- `Suggested fix: <concise wording/rule>`
- `Blocking: yes|no`

`[high]` means PRD drift, missing required slice, oversized slice, or blocked sequencing.
`[medium]` means weak acceptance, vague validation, or likely planning confusion.
`[low]` means minor clarity cleanup.

If clean, say so and note residual risks.
