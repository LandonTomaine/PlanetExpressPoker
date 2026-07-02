---
name: review-product-prd
description: Review a child PRD for parent-PRD alignment, MVP scope, no overbuilding, clear user outcomes, edge states, explicit non-goals, integration boundaries, and implementation-planning readiness. Use as a PRD review gate before backlog slicing.
---

# Review Product PRD

Primary lens: `Product/PRD`.

## Goal

Find product-scope issues before a child PRD becomes backlog work.

## Workflow

1. Read parent PRD Section 19 and the selected capability section.
2. Read the child PRD under review.
3. Compare against one nearby child PRD only for shape if needed.
4. Return findings only; do not edit.

## Checks

- Matches the selected Section 19 capability and does not pull later capabilities forward.
- Preserves MVP bias: manual before automated, simple states, no speculative platform work.
- Defines actor, outcome, scope, non-goals, dependencies, edge/recovery states, and UX requirements when product-relevant.
- User-visible scope names key flows: first-time, edit, empty, error, blocked.
- Risky concepts define user-facing terms and consequence copy.
- Save/delete/hide/deactivate/publish flows explain client/booking impact.
- Mobile/admin-density expectations exist when relevant.
- Avoids implementation design, handler names, schema choices, or task lists.
- Uses product-facing language and avoids internal-only terms.
- Leaves no blocking ambiguity for backlog slicing.

## Output

Use:

- `[high|medium|low] file:line - finding`
- `Why it matters: <short impact>`
- `Suggested fix: <concise wording/rule>`
- `Blocking: yes|no`

`[high]` means scope drift, missing core behavior, hidden future capability, missing required UX behavior, or blocking ambiguity.
`[medium]` means unclear acceptance, weak edge/UX states, or likely backlog confusion.
`[low]` means wording or organization cleanup.

If clean, say so and note any assumptions.
