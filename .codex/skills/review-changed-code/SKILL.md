---
name: review-changed-code
description: Review the current code changes against this repo's standards and directly related context. Use when the user asks for a code review, PR review, changed-code review, diff review, or a reviewer pass on in-flight edits. This skill is for reviewing the current changes only, not for broad repo audits or architecture-smell scans unless the user explicitly expands the scope.
---

# Review Changed Code

Primary lens: `Review`.

## Goal

Review the current diff and only the minimum surrounding context needed to judge it. Use the repo's architecture, coding, testing, and workflow guidance as the review standard.

## Workflow

1. Load only the standards docs needed for the changed area.
   - Backend or architecture changes: `docs/architecture/overview.md`, `docs/development/backend.md`
   - Frontend or UI changes: `docs/development/frontend.md`, `docs/architecture/overview.md`
   - Validation/workflow expectations when relevant: `docs/development/testing/strategy.md`, `docs/development/tooling.md`, `docs/development/workflow.md`
2. Load the checklist after the scope is clear.
   - Read `references/review-checklist.md`.
3. Review only the diff and directly related code needed to understand it.
   - Do not turn this into a whole-repo audit.
4. Use the validation output if it was provided.
   - Treat failing or skipped validation as review context.
   - If validation is missing, note the gap instead of inventing results.
5. Return findings first.
   - Prioritize bugs, regressions, rule violations, risky dependency changes, and missing validation.
6. If the main agent asks follow-up questions or asks you to reassess a disputed finding, discuss the exact rule, risk, and tradeoff.
   - Defend the finding when the rule or risk is real.
   - Withdraw or downgrade it when the implementation is acceptable under the repo standards.
   - Do not edit files unless the main agent explicitly changes your role from reviewer to implementer.

## Review Standard

- Trust repo docs, local code, and architecture tests over generic preferences.
- Focus on:
  - architecture boundary violations
  - business logic in the wrong layer
  - wrong standard choice
  - persistence misuse
  - wrong test-layer choice, missing regression coverage, or missing browser coverage when user-visible behavior changed
  - missing validation or risky skipped validation
  - behavioral regressions
  - overengineering or unnecessary new abstractions

Do not nitpick style unless it violates repo guidance, obscures correctness, or was introduced by the current change.

## Output

Return findings first, ordered by severity, with file and line references when possible.
Then include validation gaps or residual risk.
If there are no findings, say so explicitly.

Use:

- `[high|medium|low] file:line - finding`
- `Why it matters: <short paragraph>`
- `Blocking: yes|no`

Severity:

- `[high]` correctness, data loss, security, architecture-boundary, or major regression risk
- `[medium]` maintainability or validation gaps that materially increase risk
- `[low]` worthwhile but non-blocking

## Handoff Contract

- Main agent should provide:
  - changed files or diff summary
  - relevant repo docs/rules
  - validation output
  - any explicit out-of-scope notes
- Reviewer should return:
  - findings with rule/risk basis
  - validation gaps
  - whether each finding looks blocking or non-blocking

If the main agent asks whether a finding should be fixed, answer from repo rules and change risk, not from preference.

## Do Not

- Do not edit code by default.
- Do not turn this into a repo-wide audit.
- Do not manufacture findings.
- Do not hide uncertainty; say when a finding depends on an assumption.
