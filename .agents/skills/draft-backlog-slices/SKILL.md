---
name: draft-backlog-slices
description: Draft or revise capability backlog folders from child PRDs. Use when Codex needs to break a numbered requirement document into an epic, features, user stories, implementation slices, dependencies, validation expectations, and delivery tracking under `docs/backlog` capability folders.
---

# Draft Backlog Slices

Primary lens: `Product/PRD`.

## Workflow

1. Load backlog and product context.
   - `docs/backlog/README.md`
   - source child PRD under `docs/product/requirements/`
   - nearest existing capability backlog for shape when one exists

2. Create or revise the capability delivery folder.
   - Use `docs/backlog/<numbered-capability>/`.
   - Use `backlog.md` for the shared backlog.
   - Use `plans/` for approved implementation plans.
   - Use `workflows/` for orchestration state.
   - Use `artifacts/` for workflow screenshots and validation artifacts.
   - Keep artifact paths shallow: `artifacts/<slice-id>/<short-name>.<ext>`, with no dated workflow folder.

3. Draft the backlog.
   - Keep it delivery-facing, not implementation design.
   - Preserve the child PRD's product scope and non-goals.
   - Include one epic, feature groups, user stories, implementation slices, dependencies, and acceptance.
   - Track progress at implementation-slice level.
   - Split slices so each can later go through `plan-implementation-work`.
   - Main user workflows need feature-close E2E coverage, not per-slice by default.
   - Do not choose code files, handlers, schema details, or UI component structure here.

4. Update discoverability.
   - Update `docs/backlog/index.md`.
   - Update the child PRD `Delivery backlog` link if needed.
   - Update the parent PRD document map if needed.

5. Review for drift.
   - Backlog slices must cover the child PRD without adding later capabilities.
   - Do not add adjacent capabilities unless the PRD explicitly includes them.

## Backlog Shape

Use this outline:

- `# <Capability> Backlog`
- `Status`, `Date`, `Requirement document`, `Backlog index`
- `Purpose`
- `Tracking Conventions`
- `Epic`
- `Features And Stories`
- `Recommended Agent Work Order`
- `Agent Handoff Guidance`

## Quality Bar

- Concrete enough to sequence delivery.
- Small enough slices for focused implementation plans.
- Requirements traceable to the child PRD.
- No implementation plan hidden inside the backlog.
- Plans and workflow state stay inside the capability folder, not `.agents/`.
