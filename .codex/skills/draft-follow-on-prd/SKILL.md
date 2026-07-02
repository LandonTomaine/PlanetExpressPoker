---
name: draft-follow-on-prd
description: Draft concise follow-on product requirement documents from the parent PRD. Use when Codex needs to define the next capability from `docs/product/requirements/00-product-prd.md`, create or revise a numbered child requirement doc under `docs/product/requirements/`, or keep requirement documents aligned in shape and scope.
---

# Draft Follow-On PRD

Primary lens: `Product/PRD`.

## Workflow

1. Load parent and product context.
   - Parent PRD plus the selected capability section or scope area.
   - One nearby requirement doc only for shape when needed.
   - [references/competitor-research.md](references/competitor-research.md) only when competitor research informs the PRD
   - only other product docs needed for the capability

2. Confirm the capability boundary.
   - Use the parent PRD capability section as scope source.
   - Keep child PRDs product-facing, not implementation plans.
   - Do not pull later capabilities into the current doc.
   - Surface blocking product ambiguity before writing.

3. Draft or revise the child PRD.
   - Match the repository's existing compact PRD structure and tone.
   - Prefer concrete requirements and acceptance bullets over long prose.
   - Include UX requirements only when they define product behavior.
   - For user-visible work, name key states, terms, and consequence copy.
   - Separate readiness signals from full public booking readiness.

4. Update requirements discoverability.
   - Add the child requirement doc to `docs/product/requirements/README.md`.
   - Keep numbering aligned with `docs/backlog/<numbered-capability>/` when a matching backlog also exists.
   - Do not create a backlog unless the user asks or implementation slicing is next; use `draft-backlog-slices` when it is time.

5. Review for drift.
   - Compare against the parent PRD.
   - Compare shape against one nearby child PRD when useful.
   - Cut speculative details, implementation design, and repeated product glossary content.

## Child PRD Shape

Use this outline unless the capability clearly needs less:

- `# <Capability> Requirements`
- `Status`, `Date`, `Parent document`
- `Purpose`
- `Problem Statement`
- `Scope`
- `Primary Actor`
- `Outcome Definition`
- `Dependencies And Boundaries`
- `<Capability> Overview`
- `Detailed Requirements`
- `UX Requirements` when product-relevant
- `Edge And Recovery States`
- `Explicit Non-Goals`
- `Implementation-Planning Handoff`

## Quality Bar

- Short enough to skim.
- Same document shape as nearby child PRDs unless there is a reason to differ.
- Requirements before acceptance.
- Explicit in/out scope.
- Concrete edge states.
- No implementation task list inside the PRD.
- No duplicated glossary or parent PRD paragraphs.
