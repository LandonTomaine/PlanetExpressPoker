# Pull Request Guidance

All changes must enter `main` through a pull request.

## Required Flow

1. Create a short-lived branch from `main`.
2. Keep the change focused.
3. Run the relevant local validation before pushing.
4. Open a pull request.
5. Wait for required CI, CodeQL, Codex review, and owner review.
6. Merge only after approval.

## Pull Request Expectations

- Keep the scope coherent.
- Summarize what changed and why.
- Mention validation that was run.
- Call out any skipped validation or residual risk.

## Non-Goals

- Do not open broad "everything changed" pull requests when the work can be split.
- Do not bypass the pull request path for local setup, documentation, dependency, or automation changes.
