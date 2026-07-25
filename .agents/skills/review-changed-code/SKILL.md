---
name: review-changed-code
description: Review the current diff against repo standards and directly related code. Use for code, PR, diff, or in-flight change reviews; not broad audits.
---

# Review Changed Code

Primary lens: `Review`.

## Workflow

1. Load only standards matching the diff:
   - architecture/backend: `docs/architecture/overview.md`, `docs/development/backend.md`
   - frontend/UI: `docs/development/frontend.md`
   - validation: `docs/development/testing/README.md`, `docs/development/safeguards.md`
2. Read `references/review-checklist.md`.
3. Inspect the diff and minimum related code.
4. Use supplied validation. Report missing or skipped checks; never invent results.
5. Return findings first. Reassess disputed findings against the exact repo rule and risk.

Focus on correctness, security, boundaries, persistence, test-layer choice, regressions, missing UI validation, and unnecessary abstraction. Ignore preference-only style.

Do not edit unless explicitly reassigned as implementer. Do not broaden into a repo audit or manufacture findings.

## Output

Order findings by severity:

`[high|medium|low] file:line - finding`

- Why it matters
- Rule/risk basis
- Blocking: `yes|no`

Severity:

- high: correctness, data loss, security, boundary, or major regression
- medium: material maintainability or validation risk
- low: worthwhile, non-blocking issue

Then list validation gaps and residual risk. If none, say `No findings`.
