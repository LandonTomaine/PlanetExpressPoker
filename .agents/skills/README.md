# Repo-Local Skills

Repo-local skills for Planet Express Poker.

Skills live under `.agents/skills/`. Do not add new repo-local skills elsewhere.

Use a skill only when the task clearly matches it. Otherwise use the shared docs.

## Active Skills

| Skill                        | Use When                                                 |
| ---------------------------- | -------------------------------------------------------- |
| `draft-follow-on-prd`        | Write the next child PRD from the parent PRD.            |
| `review-product-prd`         | Review a child PRD before backlog slicing.               |
| `draft-backlog-slices`       | Turn a child PRD into backlog slices.                    |
| `review-backlog-slices`      | Review backlog slices before implementation planning.    |
| `plan-implementation-work`   | Create an implementation-ready plan.                     |
| `review-implementation-plan` | Review a plan before coding.                             |
| `implement-planned-work`     | Execute an approved plan end to end.                     |
| `orchestrate-work-plan`      | Run a resumable multi-slice workflow.                    |
| `resolve-bug`                | Reproduce, fix, and validate a concrete bug.             |
| `review-changed-code`        | Review current code changes.                             |
| `complete-pr`                | Push, open/update, review, and complete a PR.            |
| `audit-skill-opportunities`  | Decide if a repeated workflow needs a skill.             |
| `audit-standards-docs`       | Audit docs and agent guidance for JEC and drift.         |
| `retheme-app`                | Replace the current theme while preserving app behavior. |

## Possible Future Skills

- Supabase migration workflow, if schema changes become frequent
- Browser-validation workflow, if Playwright/manual testing grows beyond the current smoke path
