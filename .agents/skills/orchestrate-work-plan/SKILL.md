---
name: orchestrate-work-plan
description: Orchestrate a child PRD, backlog, feature plan, story breakdown, or multi-task implementation document as a resumable delivery workflow. Use when the user says to use this skill on a file or asks Codex to take a capability through backlog slicing, implementation planning, coding, validation, review, commits, and continuation. Creates durable workflow state, self-checks with subagents, asks the real user only for blocking ambiguity, and resumes safely after context compaction or interruption.
---

# Orchestrate Work Plan

Primary lens: `Implementation`; switch to `Product/PRD` or `Review` for matching gates.

## Goal

Turn `use $orchestrate-work-plan on <file>` into a durable, autonomous implementation workflow.

Act as the conductor. Move the source through the next needed stage, then execute one implementation slice at a time:

`child PRD -> backlog folder -> per-slice implementation plan -> implementation -> validation -> code review -> commit -> next slice`

Use subagents to self-check backlog shaping, implementation planning, and changed code. Surface only unresolved blocking ambiguity to the real user.

## Source Modes

- Child PRD: `docs/product/requirements/<numbered-capability>.md`
  - Use `draft-backlog-slices` first.
  - Create or revise `docs/backlog/<numbered-capability>/backlog.md`, `plans/`, `workflows/`, and `artifacts/`.
  - Self-check the backlog with a subagent before treating it as executable.
- Capability backlog: `docs/backlog/<numbered-capability>/backlog.md`
  - Select the next unblocked implementation slice.
  - Create a focused plan under `docs/backlog/<numbered-capability>/plans/`.
- Implementation plan: `docs/backlog/<numbered-capability>/plans/*.md`
  - Execute the plan directly with `implement-planned-work`.
- Workflow state: `docs/backlog/<numbered-capability>/workflows/*.md`
  - Resume from the workflow file before selecting new work.

Default granularity is one implementation slice. Do not plan or implement a whole feature or epic at once unless the backlog proves the scope is tiny or the user explicitly asks.

## Called By MVP Delivery

When invoked from `orchestrate-mvp-delivery`:

- Own exactly the capability backlog/workflow execution layer.
- Do not select, create, close, or advance MVP capabilities.
- After a slice completes or blocks, return control with: workflow path, slice ID, status, validation, review result, browser-validation result or non-UI reason, commit/push status, blockers, and residual risk.
- A completed slice handoff is not workflow completion unless every queue item is `done` or explicitly skipped.

## Preconditions

Before creating or advancing a queue:

1. Check `git status --short --branch`.
2. Require a clean worktree unless the user explicitly wants to include existing changes.
3. Require a branch for the orchestration work.
   - A direct request to use this skill on a PRD/backlog/plan permits creating a branch when the current branch is not already a suitable work branch.
   - Prefer `codex/<short-purpose>` for new branches.
4. Push or report unpushed baseline commits before starting when remote-safe workflow is requested or already implied.

## Ambiguity

Do not guess product, UX, architecture, data, validation, or scope decisions.

- Use a planning subagent first to challenge task boundaries and code shape.
- If ambiguity still blocks correctness, task boundaries, validation, ordering, or code shape, raise it to the real user.
- Ask only blocking questions, preferably in small batches tied to the next executable work.
- Do not delegate ambiguity resolution to implementation workers.
- Continue around a blocked task when independent ready tasks remain.
- Stop when all remaining work depends on the unanswered decision.

## Create The Queue

1. Resolve the source document.
   - Accept inline chat, a local file, a tracker item, an issue, or a PR comment.
   - If the source is inaccessible, stop and report the exact blocker.
   - If the source is a child PRD, first create or revise the matching capability backlog with `draft-backlog-slices`.
   - If a backlog was created or revised, run a review subagent to check PRD coverage, non-goal drift, slice size, dependencies, and handoff clarity.
   - Fix blocking backlog review findings before implementation planning.
   - Commit backlog creation or revision as its own planning change before code implementation starts.

2. Normalize the work into independent task packets.
   - Preserve original IDs when available.
   - For capability backlogs, preserve existing slice IDs when present and use those as task IDs.
   - Split tasks until each packet can be implemented, validated, reviewed, and committed independently.
   - Record dependencies instead of carrying hidden ordering in prose.
   - Mark tasks `blocked_user` when requirements are missing.
   - Use a planning subagent with `plan-implementation-work` for the selected slice before coding.
   - Have the planner pressure-test local pattern choice, abstraction choice, test-layer choice, and validation needs.
   - Surface only unresolved, blocking ambiguity to the real user.
   - The orchestrator may approve a planning subagent's draft plan and write it without asking the real user when there is no unresolved blocking ambiguity and the plan stays within the selected slice.
   - Ask the real user before writing a plan only when the plan changes product scope, crosses slice boundaries, chooses between materially different architecture directions, or leaves validation unclear.
   - Save approved slice plans under `docs/backlog/<numbered-capability>/plans/`.
   - Mark the slice `planned` in the backlog after its plan is written.

3. Write durable state before implementation.
   - Use `docs/backlog/<numbered-capability>/workflows/YYYY-MM-DD-short-title.md` unless the user specifies a path.
   - Keep it concise enough to reload cheaply after context compaction.

Use this shape:

```markdown
# Workflow: <title>

Source: <file, issue, chat, or tracker reference>
Branch: <branch>
Status: active

## Rules

- Execute one task at a time.
- Commit after each completed task.
- Ask only blocking questions.
- Continue around blocked tasks when independent work is ready.
- Stop on failed validation, unsafe git state, or unexpected broad scope.

## Queue

| ID  | Status  | Depends On | Summary        | Validation      |
| --- | ------- | ---------- | -------------- | --------------- |
| T1  | pending | -          | <one sentence> | <focused check> |

## Current Task

None

## Log

- <date>: Created workflow from <source>.
```

## Execute Tasks

For each task:

1. Select the next `pending` or `ready` task whose dependencies are `done`.
2. Update durable state:
   - Set the task to `in_progress`.
   - Copy its packet into `Current Task`.
   - Log the start time and intended validation.
   - Mark the matching backlog slice `in_progress`.
3. Create a minimal handoff for the implementation pass:
   - task ID and goal
   - acceptance criteria
   - files or areas likely involved
   - dependency notes
   - exact validation expected
   - standard choices when relevant
   - instruction to use `implement-planned-work`
4. Use subagents where useful, but delegate only one implementation task at a time unless tasks are independent and write scopes are disjoint.
5. After implementation, inspect the diff yourself.
6. Run or verify the task validation.
   - Run foreground validation commands with explicit bounded timeouts. Use 5 minutes as the default maximum for build, test, lint, format, and diff checks unless the repo guidance or the specific command is known to need longer.
   - Do not let a foreground tool command run open-ended during orchestration. If a bounded command times out, inspect whether it is still running, stop only the process the current agent started when appropriate, record the timeout in workflow state, and either retry once with a concrete reason or stop with a blocker.
   - Do not run build, test, format, lint, or generated-output commands in parallel when they can write the same output folders, caches, test database, or generated assets. Sequence them, or build once and use `--no-build` where safe.
   - Long-lived app servers, watch processes, and browser validation support processes are exceptions to the foreground timeout rule: start them non-blocking, capture their process IDs and logs, use a bounded readiness wait, and clean them up before marking validation complete.
   - If the task changes user-visible UI behavior, run a concrete browser-validation flow before marking the task done.
   - If integrated browser validation cannot be completed for a UI task, do not mark the task done unless the real user explicitly waives that requirement; record the blocker or waiver in durable state.
   - Append command/tooling/environment/bad-assumption incidents to `.agents/state/ai-process-issues.md` at the point of failure or the next durable state update. Include workflow/slice, symptom, cause, corrective action, occurrence key, and count if known.
   - Logging an incident does not automatically stop the task. Run `improve-ai-self` only after three recorded occurrences of the same occurrence key, or after one severe workflow-state, validation-integrity, commit, scope-control, or destructive-action failure.
7. Require a review subagent after validation and before commit.
   - Use the repo-local `review-changed-code` skill for this review.
   - Give the reviewer the source PRD/backlog slice, implementation plan, changed files or diff summary, and validation output.
   - Require checklist-backed findings.
   - Spawn at most two review subagents for a single task. After two review passes, resolve any remaining findings yourself, record residual risk, and continue or stop instead of looping.
8. Update durable state with:
   - `Status: done`
   - files changed summary
   - validation result
   - browser-validation result for UI tasks, including what was checked and what remains unverified
   - review result
   - follow-ups or residual risk
   - Mark the matching backlog slice `done`, or `blocked` with a blocker note.
   - Do not reopen or recommit the workflow file only to paste commit SHAs. Git history is the source of truth for commit IDs.
9. Commit the completed task, including code, tests, plan updates, workflow state, backlog status, and validation artifacts, with a focused message.
10. Push progress when the branch has an upstream or the user asked for remote-backed progress.
    - For code changes, do not treat narrowed validation as sufficient push validation unless the user explicitly accepts the risk.
    - Prefer the repo's current pre-push hook as the final local gate when it exists.

## Self-Check Requirements

Use [references/handoffs.md](references/handoffs.md) for backlog-review, planning, and changed-code review handoffs.

- Use a subagent to review a newly created or substantially revised backlog before implementation planning.
- Use a planning subagent for each selected slice unless the implementation plan already exists and is current.
- Use a review subagent after each implementation task and before commit.
- Do not let subagents decide product ambiguity. They may identify ambiguity; unresolved blocking questions go to the real user.
- After every subagent result, inspect the relevant diff or plan yourself and record the outcome in workflow state.

## Stop Conditions

Stop instead of continuing when:

- the worktree is dirty with overlapping changes not made by the current task
- all remaining tasks need user decisions
- validation fails for an in-scope reason after a reasonable fix attempt
- a task cannot be completed without broadening scope beyond its packet
- a commit cannot be created cleanly
- queue state and git history disagree

When stopping, update durable state with the blocker, leave the worktree understandable, and report the exact next decision needed.

## Resume

When resuming:

1. Read the workflow file first.
2. Check `git status --short --branch` and recent commits.
3. Reconcile queue status with the worktree and recent `git log`; do not require SHAs in the workflow file.
4. If a task is `in_progress`, inspect the worktree and either finish it, mark it blocked, or restore the queue to `pending` only when no task changes exist.
5. Continue with the next unblocked task.

## Completion

Complete the workflow only when every queue item is `done` or explicitly `skipped` with a reason.

Final report:

- workflow file path
- backlog file path
- implementation plan paths created or used
- completed task IDs and commit summary
- validation summary
- skipped or blocked work
- branch and push status
