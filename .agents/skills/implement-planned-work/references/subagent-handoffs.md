# Subagent Handoffs

Use this only when `implement-planned-work` needs worker or reviewer delegation.

For changed-code review, delegate to a reviewer using `review-changed-code`. When called inside `orchestrate-work-plan`, leave the final review loop to the orchestrator.

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
