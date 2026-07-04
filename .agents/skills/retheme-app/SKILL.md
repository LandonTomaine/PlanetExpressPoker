---
name: retheme-app
description: Rebrand Planet Express Poker from its current Futurama/Planet Express theme to a user-specified theme. Use when Codex is asked to replace the app title, logo, avatars, special-card artwork, quotes, reaction GIFs, delivery/ship effects, Easter eggs, colors, or theme-specific product/docs wording while preserving planning poker behavior.
---

# Retheme App

Primary lens: `Implementation`; use `UX` for visual/theme choices.

## Goal

Replace the themed presentation layer without changing core planning poker behavior.

Core behavior to preserve:

- room creation/join
- remembered name/avatar
- voter/spectator roles
- voting/reveal/countdown/next round
- scoring, average, recommendation
- realtime sync
- simulator route
- fun effects on/off

## Required References

Load these before editing:

- [references/current-theme-inventory.md](references/current-theme-inventory.md)
- [references/retheme-checklist.md](references/retheme-checklist.md)

Load product docs only when user-facing behavior or wording changes:

- `docs/product/easter-eggs-and-animation.md`
- `docs/product/overview.md`
- `docs/product/requirements/00-product-prd.md`

## Workflow

1. Define the new theme.
   - Confirm app title, short brand name, visual tone, and source preferences.
   - Ask for provided assets first; otherwise source reaction GIFs from Giphy or Tenor and icons/avatars from reputable icon/image sources.
   - Record replacement mappings before editing.

2. Inventory the current theme surface.
   - Use the bundled inventory as the starting map.
   - Search for theme terms before editing: `Planet Express`, `Futurama`, `Bender`, `Fry`, `Leela`, `Nibbler`, `Lrrr`, `Hypnotoad`, `ship`, `delivery`.
   - Include docs and tests in the search, not only UI code.

3. Replace assets and mappings.
   - Add new files under `public/` with clear, theme-neutral names when possible.
   - Update avatar catalog, card artwork, fun GIF maps, quotes, captions, logo/title, alt text, and effect labels.
   - Preserve special-card semantics unless the user explicitly changes them: `ship` means infinity, `BIG` means large estimate, `nibbler` means unknown, `coffee` means N/A.

4. Update product/docs wording only where current guidance becomes stale.
   - Keep docs concise.
   - Do not rewrite historical backlog material unless it is routed as current guidance or would mislead future work.

5. Validate.
   - Run `npm.cmd run format:check`.
   - Run `npm.cmd run lint`.
   - Run `npm.cmd run typecheck`.
   - Run `npm.cmd run test:unit`.
   - Run `npm.cmd run test:integration`.
   - Run `npm.cmd run test:architecture`.
   - Run `npm.cmd run build`.
   - Run `npm.cmd run test:e2e` when `.env` points at a usable Supabase project.
   - Browser-check home, room join, avatar selection, special cards, reveal reactions, delivery/manual effect, and simulator route.

## Rules

- Do not change database schema for a theme-only request.
- Do not break existing persisted room values unless a migration/default fallback is planned.
- Keep replacement media lightweight enough for Cloudflare Pages.
- Prefer one new theme vocabulary file or mapping over scattered hardcoded strings if theme-specific branching grows.
- Keep accessibility labels accurate after asset swaps.
- If using Giphy/Tenor URLs, download and commit the selected media instead of depending on hotlinked assets.
- Document uncertain third-party licensing or source attribution in the handoff.

## Output

Report:

- old-to-new theme mapping
- files/assets changed
- validation run
- any assets that still need user approval or replacement
- any product/docs wording intentionally left unchanged
