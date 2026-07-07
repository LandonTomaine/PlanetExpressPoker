---
name: add-theme-pack
description: Add built-in Planet Express Poker theme packs through the registry-based theme system. Use when Codex is asked to add a new theme with assets, copy, logos, avatars, card artwork, quotes, reactions, vehicle effects, colors, persistence validation, or theme docs while preserving planning poker behavior.
---

# Add Theme Pack

Primary lens: `Implementation`; use `UX` for visual/theme choices.

## Goal

Add theme packs. Do not change planning poker behavior.

## Required References

Load these before editing:

- `docs/development/themes.md`
- [references/add-theme-checklist.md](references/add-theme-checklist.md)

Load product docs only when user-facing behavior or wording changes:

- `docs/product/easter-eggs-and-animation.md`
- `docs/product/overview.md`
- `docs/product/requirements/00-product-prd.md`

## Workflow

1. Define theme ID, app title, short brand, visual tone, and asset source preference.
2. Source or place local assets under `public/themes/<theme-id>/`; no hotlinks.
3. Add the full `ThemeConfig` in `src/features/theme/registry.ts`.
4. For new theme IDs, update `ThemeId`, Supabase validation, and API schemas.
5. Update tests, `ASSET_NOTICES.md`, and only stale docs.
6. Validate with the checklist and browser smoke the themed flows.

## Rules

- Add themes through the registry. Avoid new scattered theme branches.
- Keep stable card values and reaction keys unless a migration is included.
- Never commit service-role keys, secret keys, tokens, or database passwords.
- Preserve asset formats unless the user approves a change: SVG with SVG, GIF with GIF, PNG with PNG, video with video.
- Record source URLs, licensing, and uncertainty in `ASSET_NOTICES.md`.

## Output

Report:

- registry/theme IDs changed
- assets changed
- docs/notices changed
- validation run
- unresolved asset or licensing issues
