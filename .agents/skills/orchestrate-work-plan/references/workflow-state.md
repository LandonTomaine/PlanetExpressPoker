# Workflow State

Keep resumable state at `docs/backlog/<capability>/workflows/YYYY-MM-DD-short-title.md`.

```markdown
# Workflow: <title>

Source: <file, issue, chat, or tracker reference>
Branch: <branch>
Status: active

## Queue

| ID  | Status  | Depends On | Summary        | Validation      |
| --- | ------- | ---------- | -------------- | --------------- |
| T1  | pending | -          | <one sentence> | <focused check> |

## Current Task

None

## Log

- <date>: Created workflow from <source>.
```

## State Rules

- Statuses: `pending`, `ready`, `in_progress`, `blocked_user`, `done`, `skipped`.
- One task `in_progress` at a time.
- Update the matching backlog slice with the workflow task.
- Record files changed, validation, browser validation for UI work, review result, blockers, and residual risk.
- Do not paste commit SHAs into state; Git history owns them.

## Resume

1. Read state first.
2. Check branch, worktree, and recent commits.
3. Reconcile queue state with worktree and Git history.
4. Finish or block an `in_progress` task; return it to `pending` only when no task changes exist.
5. Continue with the next unblocked task.
