---
name: resolve-bug
description: Investigate, fix, and validate a reported bug or regression. Use when the user reports broken behavior from human testing, asks Codex to reproduce and fix a defect, or an orchestrated workflow needs a focused bug-resolution pass. Do not use for general code review, broad architecture audits, CI failures, or unresolved PR review comments unless the issue is first converted into a concrete bug to reproduce.
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
   - Add or update regression coverage at the correct layer using `docs/development/testing/strategy.md` when tests are needed.

5. Validate the fix.
   - Re-run the failing reproduction first.
   - Run the narrowest relevant automated tests, then broader validation if the touched area warrants it.
   - Use a concrete browser or UI validation path when the bug or fix affects user-visible behavior.
   - Use `review-changed-code` for a reviewer pass when the fix is non-trivial, risky, or part of an orchestrated workflow.

6. Report the outcome.
   - State the reproduced symptom, root cause, files changed, tests or browser checks run, and any residual risk.
   - If the fix could not be completed, leave the worktree understandable and name the blocker precisely.

## Routing Notes

- Use `plan-implementation-work` first only when the bug is ambiguous, broad, or needs an approved implementation plan before coding.
- Use `orchestrate-work-plan` only when the bug is part of a durable multi-task workflow; this skill can be a focused execution step inside that workflow.
- Prefer GitHub-specific skills for PR comments, issues, or CI failures until they identify a concrete app defect to fix.
