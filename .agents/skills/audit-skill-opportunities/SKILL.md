---
name: audit-skill-opportunities
description: Audit this repository for missing repo-local Codex skills. Use when Codex needs to decide whether this repo should add another skill, identify concrete skill candidates, or review whether a repeated repo-specific workflow belongs in a skill instead of shared docs. Recommend new skills only when the workflow is truly repo-specific, repeatable, and not already covered well enough by existing skills, shared standards docs, or always-loaded instructions.
---

# Audit Skill Opportunities

Primary lens: `Review`.

## Goal

Find high-value missing repo-local skills without inventing skills for work that should stay in shared docs, existing repo skills, or general agent behavior.

A proposed skill must clear all of these bars:

- repo-specific enough that a generic model would benefit from reusable guidance
- repeatable enough to justify a skill instead of one-off reasoning
- narrow enough to have a clear trigger and output
- not already covered well enough by existing repo skills, `docs/`, `agent-rules/`, or always-loaded instructions

If nothing clears that bar, return `no change needed`.

## Workflow

1. Inventory current coverage before proposing anything.
   - Read the existing repo-local skills under `.agents/skills/`.
   - Load only the additional docs needed for candidate surfaces you inspect.
   - Note which workflows already have a skill and which ones are already handled well enough by shared docs.

2. Look for real skill surfaces.
   - Inspect the repo structure, routed docs, and repeated task patterns.
   - Favor evidence such as repeated multi-step workflows, repo-specific architecture chores, specialized tool flows, or repeated prompts that would keep being reconstructed.
   - Use [references/opportunity-checklist.md](references/opportunity-checklist.md) for candidate tests and anti-patterns.

3. Reject weak candidates aggressively.
   - Do not recommend a skill when a short shared doc, route update, or small standards fix is the better solution.
   - Do not recommend a skill that would mostly restate always-loaded rules or existing repo docs.
   - Do not recommend broad "do everything in this repo" skills with vague triggers.

4. Define only implementation-ready candidates.
   - For each surviving candidate, provide:
     - the workflow gap
     - repo evidence
     - why a skill is better than docs alone
     - suggested skill name
     - trigger wording
     - likely bundled resources such as `references/` or `scripts/`

5. Do not create skills from this audit.
   - This skill is audit-only by default.
   - Do not create, initialize, or edit a candidate skill unless the user explicitly asks for creation after seeing the audit results.
   - If the user wants a candidate implemented, treat that as a separate follow-up step and use `skill-creator` or direct repo edits only after explicit approval.

6. Conclude explicitly.
   - If there are no strong candidates, say `no change needed`.
   - Otherwise rank the candidates and say whether to create now or defer.

## Output

Produce a concise audit with:

- scope reviewed
- current skills considered
- findings ordered by impact
- file paths that support each candidate or rejection
- whether each item is `create skill`, `docs are enough`, `existing skill already covers it`, or `defer`
- a final conclusion: `create now`, `defer`, or `no change needed`
- a short note that no skill was created without explicit user approval

When recommending a new skill, keep the recommendation concrete enough that `skill-creator` or a direct repo-local implementation can create it without re-auditing the whole repo.
