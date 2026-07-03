# Workflow Standards

## Development Model

- Use `main` as the trunk and default integration branch.
- Keep changes focused on one task or one small related set of changes.
- Prefer short-lived branches for non-trivial work.
- Direct commits to `main` are acceptable for small, low-risk, well-validated repo setup work.

## Working Style

- Prefer small, reviewable changes over broad refactors.
- Validate the changed area before committing when practical.
- Do not leave ambiguous product or architecture behavior unresolved when it affects correctness.

## Documentation Flow

- Product scope belongs in `docs/product/`.
- architecture and durable boundaries belong in `docs/architecture/`.
- tooling, standards, and workflow belong in `docs/development/`.
- delivery planning belongs in `docs/backlog/`.

Do not create duplicate guidance across those areas unless a small routing summary is needed.

## Implementation Flow

Default flow for meaningful work:

1. confirm or refine the requirement
2. inspect the smallest relevant docs and code
3. make the smallest coherent change
4. run the cheapest meaningful validation
5. commit focused changes

## Safety Rules

- Ask before force-pushing, hard-resetting, cleaning the worktree, deleting branches, or removing tracked files.
- Ask before changing secrets, deployment settings, or existing schema history once those exist.

## Related Docs

- [commits.md](commits.md)
- [pull-requests.md](pull-requests.md)
- [tooling.md](tooling.md)
