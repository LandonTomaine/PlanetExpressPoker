# Opportunity Checklist

Use this checklist selectively while auditing for new repo-local skills.

## Good Skill Candidates

A candidate is stronger when several of these are true:

- the repo has a repeated workflow with repo-specific decisions, not just generic coding steps
- the workflow regularly needs the same files, searches, commands, or validation sequence
- the workflow benefits from a reusable checklist, handoff contract, or output format
- the workflow often needs nearby references or deterministic helper scripts
- the trigger can be described clearly in one sentence without catching unrelated requests

Examples of likely-good categories:

- repo-specific audit passes not already covered by existing skills
- repeated planning or implementation flows tied to this repo's architecture and workflow
- specialized connector or CLI workflows that matter in this repo
- narrow migration or refactor procedures with stable repo-local rules

## Reject As Docs Instead

Prefer shared docs or route updates when:

- the guidance primarily helps humans and agents equally as durable engineering policy
- the content is mostly standards, architecture, vocabulary, or workflow rules
- the need is mainly to clarify when to use unit, integration, or E2E tests and what good tests look like
- the task does not require a distinct workflow beyond "read the right docs and apply them"
- a short addition to `docs/` or `agent-rules/` would solve the problem with less complexity

## Reject As Existing Coverage

Reject the candidate when:

- an existing repo-local skill already covers the workflow with only minor wording gaps
- always-loaded rules already cover the key behavior
- the needed material already lives in a routed shared doc and does not need a separate trigger
- the proposed skill would mostly duplicate `SKILL.md` content that already exists elsewhere

## Reject As Too Broad Or Too Weak

Reject the candidate when:

- the trigger would be vague, catch-all, or overlapping with several existing skills
- the workflow is too rare or one-off to justify a maintained skill
- the skill would need to scan most of the repo every time because the scope is undefined
- the recommendation is really "Codex should be smarter" rather than "this repo has reusable procedural knowledge"

## Recommendation Bar

Recommend `create skill` only when:

1. the problem is real and evidenced in this repo
2. shared docs alone are insufficient
3. existing skills do not already cover it
4. the trigger and scope can stay narrow
5. the maintenance cost looks justified

If any of those are weak, prefer `defer` or `no change needed`.
