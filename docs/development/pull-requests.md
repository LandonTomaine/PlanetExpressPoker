# Pull Request Guidance

This repository may use direct commits to `main` for small local setup work, but pull requests are still the preferred path for larger or review-worthy changes.

## Use A Pull Request When

- the change is non-trivial
- the change affects architecture or schema shape
- the change benefits from review before merge
- the branch contains several related commits

## Pull Request Expectations

- Keep the scope coherent.
- Summarize what changed and why.
- Mention validation that was run.
- Call out any skipped validation or residual risk.

## Non-Goals

- Do not turn small repo-setup changes into process-heavy ceremony.
- Do not open broad "everything changed" pull requests when the work can be split.
