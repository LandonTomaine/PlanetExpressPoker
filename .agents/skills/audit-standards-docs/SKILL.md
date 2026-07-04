---
name: audit-standards-docs
description: Audit repository standards and guidance documents for missing, stale, duplicated, misplaced, over-broad, or unnecessarily verbose guidance. Use when Codex needs to review `AGENTS.md`, `agent-rules/`, or `docs/` for standards coverage, DRYness, brevity, just-enough-context routing quality, or gaps in product context, architecture rules, coding standards, testing strategy, tooling, workflow, or common commands.
---

# Audit Standards Docs

Primary lens: `Review`.

## Overview

Audit the repository's standards documents as a documentation system, not isolated files. Bias hard toward brevity. Clear intent beats polished prose. Full sentences are optional when short bullets or fragments are clearer.

Determine whether the current guidance is sufficient, missing important context, placed in the wrong layer, or forcing too much context into one place.

## Workflow

1. Start from the repo entrypoints.
   Inspect `AGENTS.md`, `agent-rules/README.md`, and the always-loaded agent rules as the audit target. Do not bulk-read the repo before the routing docs tell you what matters.

2. Map the audit scope before reading deeply.
   Identify which parts of `docs/` and `agent-rules/` matter for the request. Prefer indexes and targeted reads over broad directory tours. Treat the repo's just-enough-context model as a first-class audit constraint.
   Do not read `docs/drafts/` unless the task explicitly asks for draft material.

3. Load the audit checklist only after the scope is clear.
   Read [references/audit-checklist.md](references/audit-checklist.md) and use only the sections that match the current audit.

4. Audit for both content and structure.
   Check whether the guidance is:

- grounded in the current repo, code, commands, and file layout
- placed in the correct layer (`docs/` for shared durable guidance, `agent-rules/` for agent behavior and routing)
- discoverable from the routing docs without hidden required reads
- split into focused files instead of one catch-all standards document
- brief, focused, and free of obvious duplication, contradiction, or stale instructions

5. Audit for brevity first, not polish.

- Cut filler, repetition, throat-clearing, and obvious statements.
- Prefer bullets or fragments over explanatory paragraphs.
- Do not preserve full sentences just because they read better.
- Keep only wording that changes behavior, routing, or risk.

6. Verify reality before calling something missing.
   Do not label guidance as absent, stale, or incorrect until you have checked the current repo structure, relevant code, and documented commands. Prefer evidence from the repository over assumptions.

7. Conclude explicitly.
   Do not stop at "maybe." Either:

- make focused documentation fixes when the task includes improving the docs
- report findings with recommended fixes
- or state that the current guidance is sufficient and explain why

## Output

Produce a concise audit with:

- the scope reviewed
- findings ordered by impact
- file paths that support each finding
- whether each issue is a missing document, wrong placement, stale content, duplication, over-context, or unnecessary verbosity
- a final conclusion: fix now, defer with rationale, or no change needed

If you make edits, prefer deletion over rewriting, and rewriting over expansion. Default to shorter wording. Do not add prose where bullets or fragments are enough. Preserve the repo's layered documentation model.
