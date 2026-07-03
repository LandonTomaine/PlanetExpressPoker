# Audit Checklist

Use this checklist selectively. Do not load every section unless the audit actually needs it.

Do not audit `docs/drafts/` by default. Treat that folder as intentionally unrouted draft material unless the task explicitly includes it.

## 1. Routing And Context Hygiene

Check whether the repository tells agents:

- where to start
- what must always be read
- what is optional and when to load it
- when to stop reading and act

Look for:

- hidden required files that are not routed from an index
- indexes that are acting like secret standards documents
- broad overview files that force irrelevant context into every task
- duplicated routing between `AGENTS.md`, `agent-rules/`, and `docs/`
- current docs on disk that are not surfaced by the active indexes
- older docs that remain in the tree but are no longer routed or clearly marked as historical

## 2. Shared Guidance Coverage

Check whether shared docs cover the durable standards a developer or agent needs to work efficiently.

Common categories:

- product overview and domain vocabulary
- architecture and boundaries
- backend or frontend standards
- responsive UI expectations across mobile, tablet, and desktop
- tooling, setup, and common commands
- testing strategy and validation expectations
- workflow, commits, and pull requests

For testing guidance specifically, check whether the routed docs make all of these clear:

- when to choose unit vs integration vs E2E
- what each layer should and should not cover
- where each suite lives and how expensive it is expected to be
- whether related skills and workflow docs point back to the same source of truth

Missing categories are only findings if the repo actually needs them and the knowledge is not already discoverable from code or existing docs.

Also compare the documented inventory with the files that actually exist in each area. A useful doc that is invisible from the current routes is still a standards problem.

## 3. Layer Placement

Check whether guidance lives in the right layer:

- `docs/` for shared human-and-agent guidance
- `agent-rules/` for agent behavior, routing, ambiguity handling, and environment-specific caveats
- `AGENTS.md` for the top-level entrypoint only

Flag:

- engineering policy trapped in agent-only files
- product or architecture rules repeated in multiple places
- agent behavior spread through shared docs without a clear need
- architecture guidance living under development or product docs
- development standards or common commands living under architecture or product docs without a strong reason

## 4. DRY And Brevity

Check whether the documentation system says the same thing only once when possible.

Flag:

- near-duplicate rules copied between indexes and detailed docs
- long sections that restate another file instead of routing to it
- multiple docs competing to be the source of truth for the same standard
- verbose wording where a short rule and a link would do

Prefer:

- one source of truth per topic
- short indexes that route to focused docs
- concise rules with enough detail to act, but no extra narrative

## 5. Reality Check

Treat the repository as the source of truth.

Before reporting a problem, verify against:

- current file layout
- current project structure
- documented scripts and commands that actually exist
- tests or architecture checks that already enforce the rule

Flag:

- commands that no longer work
- references to missing paths or outdated modules
- docs that describe boundaries the code no longer follows

## 6. Just-Enough-Context Fit

The goal is not maximum documentation. The goal is efficient, targeted documentation.

Flag:

- one file trying to teach the whole repo
- repeated checklists copied into multiple docs
- required context that could be split into smaller focused docs
- docs that encourage loading both frontend and backend guidance for single-slice work
- docs that are technically correct but too long to be efficient entrypoints

Prefer:

- small routing indexes
- focused topic docs
- explicit "load only when needed" cues

## 7. Conclusion Standard

A good audit ends with one of three conclusions:

- fix now because the gap or misplacement materially slows work or increases mistakes
- defer because the issue is real but low-value right now
- no change needed because the existing system already routes enough context efficiently

Do not invent findings to satisfy the audit.
