# Maintaining Agent Rules

This repo uses a layered documentation model:

- `AGENTS.md` is the top-level entrypoint.
- `agent-rules/` is the agent routing layer.
- `docs/` contains shared product and engineering documentation.

## Maintenance Goals

- Keep the agent entrypoint small.
- Keep most durable guidance in shared docs that benefit humans and agents.
- Reserve agent-only files for agent behavior, not for normal engineering policy.
- Keep the documentation system DRY.
- Keep guidance brief enough that agents and humans can load only what they need.

## When To Add A Shared Doc

Add or update a shared doc when the guidance helps a human reviewer, maintainer, or teammate as much as it helps an agent.

Examples:

- architecture rules
- product vocabulary
- testing strategy
- workflow standards
- setup and tooling

## When To Add An Agent-Only Doc

Add or update an agent-only doc only when the guidance is specifically about agent behavior.

Examples:

- brevity and communication style
- ambiguity handling
- shell restrictions in this execution environment
- how to load just enough context

## Preferred Pattern

1. Put durable domain or engineering guidance in `docs/`.
2. Add a route to that doc from `agent-rules/README.md` if agents need it.
3. Add an `Agent note:` in the shared doc only if a small agent-specific caveat matters.
4. Create a new file under `agent-rules/` only if the guidance cannot fit cleanly in shared docs.

## Placement Rules

- Put architecture rules, boundaries, and cross-layer structure in `docs/architecture/`.
- Put coding standards, tooling, workflow, testing, and common commands in `docs/development/`.
- Put product context, vocabulary, personas, workflows, and scope docs in `docs/product/`.
- Keep `agent-rules/` focused on agent behavior, routing, ambiguity handling, and environment constraints.
- Keep `AGENTS.md` as a minimal entrypoint, not a second standards manual.

## File Shape

- Keep each file self-contained.
- Split docs when a section can be loaded independently.
- Avoid broad overview files that agents must read for one small concept.
- Keep indexes as routing tables, not as hidden requirements documents.
- Prefer short focused docs over long omnibus docs.
- Remove or consolidate duplicated guidance instead of repeating the same rule in multiple files.
- Prefer summaries with links over restating the same details in each index.

## Review Checklist

- Is this guidance useful to humans too?
- Is this the smallest place the rule can live?
- Does it duplicate another file?
- Is it brief enough to support just-enough-context loading?
- Is it routed from the correct layer for its topic?
- Does `agent-rules/README.md` route to it clearly?
- Would an agent know when to read it and when not to?
