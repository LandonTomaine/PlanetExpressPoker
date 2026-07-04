# Current Theme Inventory

Inventory of the current Futurama / Planet Express theme surface.

## Brand Assets

| Path                                     | Current Use                                                             |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| `public/planet-express-logo.png`         | site logo, error boundary, join modal, logo-click Easter egg            |
| `public/planet-express-ship.png`         | hero ship, infinity card art, delivery button, fun-layer ship animation |
| `public/planet-express-ship.svg`         | alternate/source ship vector                                            |
| `public/planet-express-ship-source.png`  | source/reference ship asset                                             |
| `public/planet-express-ship-source.webp` | source/reference ship asset                                             |
| `public/favicon.svg`                     | browser favicon                                                         |
| `public/icons.svg`                       | shared icon sprite                                                      |

## Avatar Assets

| Key / Character                    | Main Asset                                | Extra Asset                                           |
| ---------------------------------- | ----------------------------------------- | ----------------------------------------------------- |
| `amy` / Amy Wong                   | `public/avatars/icons8-amy.png`           | `public/avatars/amy.svg`                              |
| `bender` / Bender                  | `public/avatars/icons8-bender.png`        | `public/avatars/bender.svg`                           |
| `leela` / Leela                    | `public/avatars/icons8-captain-leela.png` | `public/avatars/captain-leela.svg`                    |
| `fry` / Fry                        | `public/avatars/icons8-fry.png`           | `public/avatars/fry.svg`                              |
| `hermes` / Hermes Conrad           | `public/avatars/icons8-hermes.png`        | `public/avatars/hermes.svg`                           |
| `mom` / Mom                        | `public/avatars/icons8-mom.png`           | not currently selectable                              |
| `nibbler` / Nibbler                | `public/avatars/icons8-nibbler.png`       | used as selectable avatar and special-card art source |
| `professor` / Professor Farnsworth | `public/avatars/icons8-professor.png`     | `public/avatars/professor.svg`                        |
| `zapp` / Zapp Brannigan            | `public/avatars/icons8-zapp.png`          | `public/avatars/zapp.svg`                             |
| `zoidberg` / Dr. Zoidberg          | `public/avatars/icons8-zoidberg.png`      | `public/avatars/zoidberg.svg`                         |
| `lrrr` / Lrrr                      | `public/cards/icons8-lrrr.png`            | selectable avatar uses card asset                     |

Code owner: `src/features/identity/avatars.ts`.

## Card Assets

| Card Value | Meaning        | Asset                                                         |
| ---------- | -------------- | ------------------------------------------------------------- |
| `ship`     | infinity       | `public/planet-express-ship.png`                              |
| `BIG`      | large estimate | `public/cards/icons8-lrrr.png`                                |
| `nibbler`  | unknown / `?`  | `public/cards/icons8-nibbler.png`, `public/cards/nibbler.png` |
| `coffee`   | N/A            | `public/cards/coffee-cup.svg`                                 |

Code owners: `src/features/room/voting.ts`, `src/routes/RoomPage.tsx`.

## Reaction Assets

| Trigger / Event          | Assets                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| coffee selected          | `public/effects/coffee-1.gif`, `coffee-2.gif`, `coffee-3.gif`, `coffee-4.gif`                              |
| numeric consensus        | `public/effects/hypnotoad.gif`, `consensus-2.gif`, `consensus-3.gif`, `consensus-4.gif`, `consensus-5.gif` |
| Hypnotoad special        | `public/effects/hypnotoad.gif`, `public/effects/hypnotoad.webm`                                            |
| Nibbler selected         | `public/effects/nibbler-question.gif`                                                                      |
| ship / infinity selected | `public/effects/ship-infinity.gif`                                                                         |
| Lrrr / BIG selected      | `public/effects/skeptical-fry.webm`                                                                        |
| wide numeric spread      | `public/effects/wide-spread-1.gif`, `wide-spread-2.gif`                                                    |
| delivery package drops   | `public/effects/icons8-package.png`                                                                        |

Code owners: `src/routes/RoomPage.tsx`, `src/features/room/FunLayer.tsx`, `src/features/room/fun.ts`.

## Quotes And Speakers

Defined in `src/features/room/fun.ts`.

Current speakers:

- Fry
- Bender
- Professor Farnsworth
- Leela
- Dr. Zoidberg
- Hermes Conrad
- Amy Wong
- Zapp Brannigan
- Lrrr

Current quote avatars use `/avatars/icons8-*.png` and `/cards/icons8-lrrr.png`.

## Captions, Labels, And Copy

Important theme-specific strings:

- `Planet Express Poker`
- `Planet Express logo`
- `Planet Express ship`
- `Request Planet Express delivery`
- `Delivery`
- `Ship stunt`
- `Hypnotoad`
- `Hypnotoad is resting for now.`
- `Failed to summon Hypnotoad.`
- placeholder `Hermes`

Likely owners:

- `src/app/App.tsx`
- `src/app/AppErrorBoundary.tsx`
- `src/routes/HomePage.tsx`
- `src/routes/RoomPage.tsx`
- `src/features/room/fun.ts`
- `src/features/room/voting.ts`

## Easter Eggs And Theme-Specific Events

Documented in `docs/product/easter-eggs-and-animation.md`.

- 100th round: ship celebration
- all four special cards: ship stunt
- coffee card: coffee GIF
- Nibbler card: Nibbler GIF
- ship card: fly-by
- Lrrr card: skeptical Fry GIF
- consensus: random consensus GIF, including Hypnotoad
- manual delivery button: ship delivery and packages
- keyboard sequence: ship stunt
- logo click: Hypnotoad cooldown event

## External Sourcing Notes

- Existing assets are committed local files. Do not hotlink replacements.
- Use Giphy or Tenor for replacement reaction GIF discovery.
- Download chosen GIFs into `public/effects/` with stable filenames.
- Prefer transparent PNG/SVG assets for logos, avatars, cards, props, and vehicles.
- Record uncertain licensing/source concerns in the final handoff.
