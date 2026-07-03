# Subagent Handoffs

Use this only when `implement-planned-work` needs worker or reviewer delegation.

## Availability Rules

- Treat discoverable multi-agent tooling as available.
- For `implement-planned-work` changed-code review, always delegate to a reviewer subagent.
- Exception: when `implement-planned-work` is called inside `orchestrate-work-plan`, the orchestrator owns the final review loop.
- Do not skip reviewer delegation merely because the tool was not preloaded in the immediate tool list.
- Require that reviewer subagent to use the repo-local `review-changed-code` skill.

## Implementation Worker Handoff

- task to implement
- repo/workspace path
- relevant acceptance criteria
- non-goals or out-of-scope items
- owned files or areas
- relevant standards
- required standard choices when relevant
- current worktree context for overlapping files
- expected validation
- constraints: do not edit outside scope, do not revert unrelated changes, preserve existing patterns
- required return: files changed, summary, validation run, blockers, scope concerns

## Reviewer Handoff

- tell the reviewer to use the repo-local `review-changed-code` skill
- tell the reviewer to use the repo review checklist
- limit scope to the diff and directly related context
- provide relevant standards and validation output
- state any explicit out-of-scope notes
- tell the reviewer not to fix files or perform a whole-repo audit
- require findings first with file/line references, rule basis, blocking status when possible, and residual validation risk
