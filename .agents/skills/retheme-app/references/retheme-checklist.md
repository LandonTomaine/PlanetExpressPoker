# Retheme Checklist

Use this as the implementation checklist for a theme swap.

## Theme Definition

- [ ] New app title
- [ ] Short brand name for compact UI
- [ ] New logo asset
- [ ] Primary prop/vehicle/object replacing the Planet Express ship
- [ ] Avatar roster and display names
- [ ] Special-card artwork mapping
- [ ] Reaction GIF list by trigger
- [ ] Quote/speaker list, if quotes remain enabled
- [ ] Manual fun button label
- [ ] Easter egg concepts and cooldowns
- [ ] Color palette and visual tone

## Asset Replacement

- [ ] Replace `/planet-express-logo.png`
- [ ] Replace `/planet-express-ship.png`
- [ ] Replace `/planet-express-ship.svg` or remove unused SVG references
- [ ] Replace `/planet-express-ship-source.*` if source assets should stay in repo
- [ ] Replace `/favicon.svg`
- [ ] Replace avatar assets under `/public/avatars/`
- [ ] Replace card assets under `/public/cards/`
- [ ] Replace reaction assets under `/public/effects/`
- [ ] Keep file sizes reasonable
- [ ] Use local files, not hotlinked Giphy/Tenor URLs

## Code Surface

- [ ] `src/app/App.tsx`: title card logo/title and logo-click event naming if needed
- [ ] `src/app/AppErrorBoundary.tsx`: fallback logo/title/alt text
- [ ] `src/routes/HomePage.tsx`: title, hero art, placeholders, avatar roster, copy
- [ ] `src/routes/RoomPage.tsx`: logo/title, join modal, special-card artwork, labels, buttons, captions
- [ ] `src/features/identity/avatars.ts`: avatar keys, labels, portraits, default avatar
- [ ] `src/features/room/fun.ts`: quote speakers, quote text, avatar paths, captions
- [ ] `src/features/room/FunLayer.tsx`: effect artwork, alt text, animation assumptions
- [ ] `src/features/room/voting.ts`: special-card labels/artwork names
- [ ] `src/features/room/types.ts`: fun event names when theme-specific names changed
- [ ] `src/features/room/data/roomApi.ts`: accepted fun event codes if changed
- [ ] Tests under `src/features/**`: expected labels, avatar names, special-card values

## Product And Docs

- [ ] `README.md`: app name/description/public asset notes
- [ ] `ASSET_NOTICES.md`: replacement asset sources, licenses, permissions, or ownership notes
- [ ] `LICENSE.md`: update only if source-code or asset boundary changes
- [ ] `CONTRIBUTING.md`: update if asset contribution rules change
- [ ] `docs/product/overview.md`: product name and theme description
- [ ] `docs/product/requirements/00-product-prd.md`: current product scope if theme changed permanently
- [ ] `docs/product/easter-eggs-and-animation.md`: trigger rules, captions, reaction priority
- [ ] `docs/development/frontend.md`: theme placement guidance
- [ ] `docs/architecture/overview.md` and `data-model.md`: only if theme/event vocabulary changes architectural meaning

## Search Terms Before Completion

- [ ] `Planet Express`
- [ ] `Futurama`
- [ ] `Bender`
- [ ] `Fry`
- [ ] `Leela`
- [ ] `Amy`
- [ ] `Hermes`
- [ ] `Zoidberg`
- [ ] `Professor`
- [ ] `Zapp`
- [ ] `Nibbler`
- [ ] `Lrrr`
- [ ] `Hypnotoad`
- [ ] `ship`
- [ ] `delivery`

## Validation

- [ ] `npm.cmd run format:check`
- [ ] `npm.cmd run lint`
- [ ] `npm.cmd run typecheck`
- [ ] `npm.cmd run test:unit`
- [ ] `npm.cmd run test:architecture`
- [ ] `npm.cmd run build`
- [ ] `npm.cmd run test:e2e` when Supabase env is available
- [ ] Browser smoke: home page
- [ ] Browser smoke: create/join room
- [ ] Browser smoke: avatar selection
- [ ] Browser smoke: special cards
- [ ] Browser smoke: reveal reactions
- [ ] Browser smoke: manual fun trigger
- [ ] Browser smoke: `/rooms/<room>/dev`
