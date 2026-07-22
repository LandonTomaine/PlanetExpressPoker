# Theme System

Planet Express Poker supports multiple built-in presentation themes. Themes change copy, colors, logos, avatars, card artwork, reactions, quotes, and fun-effect props without changing planning poker behavior.

## Runtime Ownership

- `src/features/theme/registry.ts` is the source of truth for built-in theme content.
- `src/features/theme/types.ts` defines the required shape every theme must satisfy.
- `src/features/theme/context.tsx` owns the active theme and writes CSS variables onto the app shell.
- `src/features/theme/ThemeSelect.tsx` renders the shared selector used by landing, directory, and room controls.
- `src/features/identity/storage.ts` persists personal theme preferences in browser storage.
- `room_settings.theme` persists the owner-selected room theme in Supabase.
- `public/themes/<theme-id>/` holds theme-specific media. Do not hotlink external media.

## Theme State Rules

- Personal theme is local to the browser and stored under `pep.theme.v1`.
- Non-room pages use the viewer's personal theme.
- Pre-join room pages use the room theme from `room_settings.theme` once settings load.
- Joined room pages use the room theme from `room_settings.theme`.
- Room owners can change `room_settings.theme` with `set_room_theme`; other participants see a disabled selector.
- Theme changes sync through the existing `room_settings` realtime subscription.
- `?createTheme=<theme-id>` is a creation-time hint. It should not keep retheming old rooms from stale URLs.

## Registry Contract

Every `ThemeConfig` owns:

| Area       | Fields                                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Identity   | `id`, `label`, `appTitle`, `shortBrand`, `tagline`                                                                                                                                               |
| Brand art  | `logoAlt`, `logoPath`, `faviconPath`, `vehicleLabel`, `vehiclePath`, `vehicleSourcePath`, `packagePath`                                                                                          |
| Page copy  | `homeEyebrow`, `homeDescription`, `roomDirectoryEyebrow`, `roomDirectoryTitle`, `roomDirectoryDescription`, `crewLabel`, `displayNamePlaceholder`                                                |
| Fun labels | `manualDeliveryLabel`, `revealCaption`, `consensusCaption`, `deliveryCaption`, `deliveryStormCaption`, `easterEggName`, `easterEggRestingMessage`, `easterEggFailureMessage`, `milestoneCaption` |
| Cards      | `cardArtworkLabels`, `cardArtworkPaths`                                                                                                                                                          |
| People     | `avatars`, `revealQuotes`, `consensusQuotes`                                                                                                                                                     |
| Reactions  | `roundReactions`                                                                                                                                                                                 |
| Styling    | `palette`                                                                                                                                                                                        |

Keep theme-specific values in the registry unless a value is durable game state. Room/voting code may use stable internal values such as `ship`, `BIG`, `nibbler`, `coffee`, and reaction keys, but display labels and media paths should come from the active theme.

## Stable Special Cards

The card values are product semantics, not theme names:

| Card value | Meaning              | Registry mapping                                        |
| ---------- | -------------------- | ------------------------------------------------------- |
| `ship`     | infinity / unbounded | `cardArtworkLabels.ship`, `cardArtworkPaths.ship`       |
| `BIG`      | very large estimate  | `cardArtworkLabels.BIG`, `cardArtworkPaths.BIG`         |
| `nibbler`  | unknown / question   | `cardArtworkLabels.nibbler`, `cardArtworkPaths.nibbler` |
| `coffee`   | not applicable       | `cardArtworkLabels.coffee`, `cardArtworkPaths.coffee`   |

## Stable Reaction Keys

`rounds.reaction_kind` stores stable keys so every browser renders the same reaction. The active theme decides the media behind each key.

| Key family                        | Trigger                     |
| --------------------------------- | --------------------------- |
| `coffee1` through `coffee4`       | at least one `coffee` card  |
| `consensus1` through `consensus5` | matching numeric consensus  |
| `nibblerQuestion`                 | at least one `nibbler` card |
| `skepticalFry`                    | at least one `BIG` card     |
| `wideSpread1`, `wideSpread2`      | numeric spread              |

Do not rename these keys unless a data migration and compatibility plan are included.

## Current Asset Inventory

### Futurama

| Use                     | Registry paths                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Logo                    | `/planet-express-logo.png`                                                                                                                                                                                                                                                                                                                                               |
| Favicon                 | `/favicon.svg`                                                                                                                                                                                                                                                                                                                                                           |
| Vehicle / infinity card | `/planet-express-ship.png`, source `/planet-express-ship.svg`                                                                                                                                                                                                                                                                                                            |
| Package drop            | `/effects/icons8-package.png`                                                                                                                                                                                                                                                                                                                                            |
| Avatar roster           | `/avatars/icons8-captain-leela.png`, `/avatars/icons8-bender.png`, `/avatars/icons8-fry.png`, `/avatars/icons8-nibbler.png`, `/avatars/icons8-amy.png`, `/avatars/icons8-professor.png`, `/avatars/icons8-zapp.png`, `/avatars/icons8-hermes.png`, `/avatars/icons8-zoidberg.png`, `/cards/icons8-lrrr.png`                                                              |
| Special cards           | `/cards/icons8-lrrr.png`, `/cards/coffee-cup.svg`, `/cards/icons8-nibbler.png`, `/planet-express-ship.png`                                                                                                                                                                                                                                                               |
| Reactions               | `/effects/coffee-1.gif`, `/effects/coffee-2.gif`, `/effects/coffee-3.gif`, `/effects/coffee-4.gif`, `/effects/hypnotoad.gif`, `/effects/consensus-2.gif`, `/effects/consensus-3.gif`, `/effects/consensus-4.gif`, `/effects/consensus-5.gif`, `/effects/nibbler-question.gif`, `/effects/skeptical-fry.webm`, `/effects/wide-spread-1.gif`, `/effects/wide-spread-2.gif` |

### Zootopia

| Use                     | Registry paths                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logo / favicon          | `/themes/zootopia/logo.svg`, `/themes/zootopia/favicon.svg`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Vehicle / infinity card | `/themes/zootopia/cruiser.svg`, source `/themes/zootopia/cards/zpd-cruiser.svg`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Package drop            | `/themes/zootopia/parking-ticket.svg`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Avatar roster           | `/themes/zootopia/avatars/judy-hopps.svg`, `/themes/zootopia/avatars/nick-wilde.svg`, `/themes/zootopia/avatars/jerry-jumbeaux-jr.svg`, `/themes/zootopia/avatars/flash.svg`, `/themes/zootopia/avatars/gazelle.svg`, `/themes/zootopia/avatars/chief-bogo.svg`, `/themes/zootopia/avatars/clawhauser.svg`, `/themes/zootopia/avatars/mayor-lionheart.svg`, `/themes/zootopia/avatars/yax.svg`, `/themes/zootopia/avatars/mr-big.svg`                                                                                                                                                                                                                                                                                                        |
| Special cards           | `/themes/zootopia/cards/mr-big.svg`, `/themes/zootopia/cards/coffee-cup.svg`, `/themes/zootopia/cards/flash-question.svg`, `/themes/zootopia/cards/zpd-cruiser.svg`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Reactions               | `/themes/zootopia/reactions/coffee-1.gif`, `/themes/zootopia/reactions/coffee-2.gif`, `/themes/zootopia/reactions/consensus-1.gif`, `/themes/zootopia/reactions/consensus-2.gif`, `/themes/zootopia/reactions/consensus-3.gif`, `/themes/zootopia/reactions/consensus-4.gif`, `/themes/zootopia/reactions/consensus-5.gif`, `/themes/zootopia/reactions/flash-question-1.gif`, `/themes/zootopia/reactions/flash-question-2.gif`, `/themes/zootopia/reactions/flash-question-3.gif`, `/themes/zootopia/reactions/flash-question-4.gif`, `/themes/zootopia/reactions/mr-big-ice-em.webm`, `/themes/zootopia/reactions/mr-big-chair-turn.webm`, `/themes/zootopia/reactions/wide-spread-1.gif`, `/themes/zootopia/reactions/wide-spread-2.gif` |

Detailed source URLs and licensing notes belong in `ASSET_NOTICES.md`.

### Toy Story

| Use                     | Registry paths                                                      |
| ----------------------- | ------------------------------------------------------------------- |
| Logo / favicon          | `/themes/toy-story/logo.svg`, `/themes/toy-story/favicon.svg`       |
| Vehicle / infinity card | `/themes/toy-story/avatars/buzz-lightyear.svg`                      |
| Package drop            | `/themes/toy-story/avatars/alien.svg`                               |
| Avatar roster           | Ten individual character SVGs under `/themes/toy-story/avatars/`    |
| Special cards           | Buzz Lightyear, Rex, Alien, and Forky                               |
| Reactions               | Trigger-appropriate local GIFs under `/themes/toy-story/reactions/` |

## Adding A Theme

1. Choose a lowercase `ThemeId` and add it to `src/features/theme/types.ts`.
2. Ask whether the user will provide assets or wants Codex to source candidates.
3. Add all required local media under `public/themes/<theme-id>/`.
4. Add a complete `ThemeConfig` entry in `src/features/theme/registry.ts`.
5. Add the theme to Supabase validation:
   - `room_settings_theme_valid`
   - `set_room_theme` accepted values
   - any API schemas that validate theme IDs
6. Keep existing stable card values and reaction keys unless a migration is planned.
7. Update tests that enumerate theme IDs, room summaries, theme selectors, or special-card labels.
8. Update `ASSET_NOTICES.md` with source URLs, license terms, permission notes, and any personal-use boundary.
9. Browser-check `/`, `/rooms`, joined room, owner theme changes, non-owner disabled state, special cards, reveal reactions, manual fun trigger, and `/rooms/<room>/dev`.

## Replacement Quality Bar

- Prefer user-provided assets. If sourcing assets, say so and record exact sources.
- Prefer fewer high-fit assets over filling every slot with weak matches.
- Mark weak or missing slots unresolved instead of inventing fake/custom assets.
- Card art must preserve meaning first: `coffee` = N/A/break, `BIG` = huge, `nibbler` = unknown/question, `ship` = infinity/unbounded.
- Reactions must match trigger emotion: consensus = celebration, wide spread = disagreement/confusion, coffee = break/N/A, `BIG` = huge/surprised/intimidating, question = uncertainty.
- Avatar rosters should avoid duplicate-looking characters and stay recognizable at small size.
- Quotes should fit the speaker and moment; do not use random franchise quotes just because they are available.
- Vehicle and prop replacements must preserve behavior roles: vehicle fly-by/stunt, manual prop drop, logo secret.

## Asset Sourcing Rules

- Prefer assets with clear reuse rights, original assets, or user-provided assets.
- Preserve asset type when replacing media: SVG with SVG, GIF with GIF, PNG with PNG, video with video unless the user approves a format change.
- Use Giphy or Tenor for reaction discovery, then save the selected media locally.
- Use reputable vector/icon sources for SVGs and record the exact page URL.
- Use quote/reference sites only to verify short quote text; keep quotes brief.
- Keep public media sizes reasonable for Cloudflare Pages.
- Treat bundled themed media as excluded from the MIT source-code license unless explicitly documented otherwise.
- Never commit service-role keys, secret keys, API tokens, database passwords, or private download credentials.

## Validation

Run at minimum:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npx.cmd vitest run src --maxWorkers=1
npx.cmd vitest run tests/integration --maxWorkers=1
npm.cmd run test:architecture
npm.cmd run build
```

Also run a public asset reference audit or equivalent check before handoff.
