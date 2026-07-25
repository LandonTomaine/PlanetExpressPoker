---
name: add-theme-pack
description: Plan, source, implement, and validate built-in Planet Express Poker theme packs through the registry system. Use for new or revised themes involving approved asset websites, logos, character SVG avatars, card art, animated reactions, vehicle effects, copy, colors, persistence, API validation, or theme documentation while preserving planning-poker behavior.
---

# Add Theme Pack

Primary lens: `Implementation`; use `UX` for visual/theme choices.

## Goal

Ship a recognizable, functional, locally hosted theme. Never fill a required slot with weak or unverified media.

## Load

- `docs/development/themes.md`
- [references/add-theme-checklist.md](references/add-theme-checklist.md)

Load product docs only when behavior or wording changes.

## Gates

1. **Plan and source contract**
   - Define theme identity, roster, every asset slot, animation role, and validation flow.
   - Record the exact user-approved source domains. If a prior agreement is unavailable, ask before sourcing.
   - Confirm the plan before downloading or implementing.
2. **Source candidates**
   - Keep candidates outside `public/` and the tracked workspace until approved.
   - Use only approved sites. Make requests serially, reuse downloads, honor `Retry-After`, and stop on rate-limit responses instead of retrying in a loop.
   - Record candidate URL, intended slot, format, rights note, dimensions/size, and GIF frame count.
3. **Approve assets**
   - Show visual candidates in chat before integration.
   - Reject generic stand-ins, logos used as people, duplicate-looking avatars, unrecognizable crops, static files labeled as GIFs, and reactions that miss the trigger emotion.
   - Leave a slot unresolved and tell the user when no accurate asset exists.
4. **Implement**
   - Copy only approved assets to `public/themes/<theme-id>/`.
   - Add the complete registry config, theme ID/API/Supabase changes, focused tests, asset notices, and only affected docs.
5. **Prove**
   - Run `node .agents/skills/add-theme-pack/scripts/audit-theme-assets.mjs <theme-id>` and the checklist.
   - Validate real create/join/reload behavior against Supabase; the simulator alone is insufficient.
   - Browser-check full-size and compact avatars, special cards, every reveal category, animations, and failed media/network requests.
   - Post screenshots of the home treatment, join/roster icons, and revealed reaction in chat. Do not push visual theme work until the user has seen them and approved the result.

## Non-negotiables

- Preserve stable card values and reaction keys unless a migration is included.
- Character avatars: distinct, character-accurate SVGs; recognizable and contained at every rendered icon size.
- GIF requirements: valid animated GIF with more than one frame. A static image with a `.gif` extension fails.
- Vehicle and package art must perform the existing animation roles; special cards must retain their semantic meanings.
- No hotlinks, unapproved source substitutions, unsafe SVG content, rejected files under `public/`, or unreferenced theme assets.
- Record exact source pages, rights/permission uncertainty, and usage boundaries in `ASSET_NOTICES.md`.

## Output

Report:

- approved sites and asset manifest
- registry, persistence, assets, notices, and docs changed
- automated, backend, browser, and screenshot validation
- unresolved quality, licensing, rate-limit, or cleanup issues
