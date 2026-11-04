---
name: resolve-bug
description: Investigate, fix, and validate a reported bug or regression. Use when the user reports broken behavior from testing or asks Codex to reproduce and fix a defect. Do not use for general code review, broad architecture audits, CI failures, or unresolved PR review comments unless first converted into a concrete bug.
---

# Resolve Bug

Primary lens: `Implementation`.

## Goal

Turn a reported symptom into a minimal, validated fix with regression coverage where practical.

## Workflow

1. Clarify only blocking ambiguity.
   - Capture the observed symptom, expected behavior, reproduction path, environment, and affected user workflow.
   - Ask the user when the bug cannot be reproduced or scoped without missing facts.
   - If the report is broad, narrow to the smallest failing behavior before editing.

2. Reproduce or prove the failure.
   - Prefer the fastest reliable reproduction: focused test, local command, handler call, browser flow, log inspection, or data setup.
   - Record what failed and how it was observed.
   - If reproduction is impossible, identify the strongest evidence available and state the uncertainty before fixing.

3. Isolate the cause.
   - Inspect the smallest relevant code path and nearby patterns.
   - Use repo docs, local code, and architecture tests as the standard.
   - Avoid turning the investigation into unrelated cleanup.

4. Implement the minimal fix.
   - Keep the change scoped to the defect.
   - Add regression coverage at the correct layer using `docs/development/testing/README.md`.

5. Validate the fix.
   - Re-run the failing reproduction first.
   - Run the narrowest relevant automated tests, then broader validation if the touched area warrants it.
   - Use a concrete browser or UI validation path when the bug or fix affects user-visible behavior.
   - Use `review-changed-code` for a reviewer pass when the fix is non-trivial or risky.

6. Report the outcome.
   - State the reproduced symptom, root cause, files changed, tests or browser checks run, and any residual risk.
   - If the fix could not be completed, leave the worktree understandable and name the blocker precisely.

## Routing Notes

- Prefer GitHub-specific skills for PR comments, issues, or CI failures until they identify a concrete app defect to fix.
