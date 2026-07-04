# Review Checklist

Use only the items that match the diff.

- Any business logic in the wrong layer for this repo's documented architecture?
- Any direct dependency or coupling that violates the current architecture overview?
- Any user-visible copy or behavior that conflicts with the PRD, backlog, or stated acceptance?
- Any risky state handling around loading, empty, disabled, success, or error paths?
- Any missing validation for bad input, duplicate action, blocked state, or recovery path?
- Any persistence or state-mutation change that lacks clear boundaries or validation?
- Any regression risk that is not covered by tests or by a concrete manual verification path?
- Any build, lint, typecheck, test, or browser-validation step missing or obviously insufficient?
- Any new abstraction, utility, or indirection that the current change did not need?
