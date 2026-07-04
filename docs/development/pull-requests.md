# Pull Request Guidance

All changes must enter `main` through a pull request.

## Required Flow

1. Create a short-lived branch from `main`.
2. Keep the change focused.
3. Run the relevant local validation before pushing.
4. Open a pull request.
5. Wait for required CI, CodeQL, CodeRabbit, and owner review.
6. Merge only after approval.

## Ship Requests

When asked to `push`, `ship`, `create a PR`, or otherwise complete a change through GitHub:

1. Push the branch and open or update the pull request.
2. Poll required checks and CodeRabbit until they reach a terminal state.
3. Inspect CodeRabbit comments and reviews for actionable issues.
4. If CodeRabbit raises an issue, decide whether it is worth resolving based on correctness, security, maintainability, and repo standards.
5. Resolve worthwhile issues, push fixes, and poll CodeRabbit again.
6. Stop instead of merging if CodeRabbit still has actionable issues after two fix-and-review loops.
7. Merge only when required checks pass, required review is satisfied, and no unresolved CodeRabbit issue remains.

Do not treat a CodeRabbit walkthrough, summary, or non-actionable note as a blocker.

## Pull Request Expectations

- Keep the scope coherent.
- Summarize what changed and why.
- Mention validation that was run.
- Call out any skipped validation or residual risk.

## Non-Goals

- Do not open broad "everything changed" pull requests when the work can be split.
- Do not bypass the pull request path for local setup, documentation, dependency, or automation changes.
