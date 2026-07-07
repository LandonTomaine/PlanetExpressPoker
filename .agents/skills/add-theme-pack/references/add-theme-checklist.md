# Add Theme Pack Checklist

Use this checklist for adding a new built-in theme.

## Theme Definition

- [ ] Theme ID added to `ThemeId`
- [ ] App title and short brand
- [ ] Visual tone and palette
- [ ] Logo and favicon
- [ ] Vehicle/object replacing the baseline ship concept
- [ ] Package/prop drop asset
- [ ] Avatar roster and display names
- [ ] Special-card artwork and labels
- [ ] Reaction GIF/video list by stable trigger key
- [ ] Quote/speaker list, if quotes remain enabled
- [ ] Manual fun button label
- [ ] Easter egg name, rest message, and failure message

## Assets

- [ ] User is providing assets, or Codex is explicitly sourcing candidates
- [ ] New theme assets live under `public/themes/<theme-id>/`
- [ ] Asset formats preserved unless approved otherwise
- [ ] No external media is hotlinked
- [ ] File sizes remain reasonable for Cloudflare Pages
- [ ] `ASSET_NOTICES.md` records exact source URLs and license/permission notes

## Quality

- [ ] Card art preserves meaning before theme flavor
- [ ] Reactions fit the trigger emotion
- [ ] Avatar roster avoids duplicate-looking characters
- [ ] Weak or missing asset matches are marked unresolved, not invented

## Registry And Code

- [ ] `src/features/theme/types.ts`: new `ThemeId` and config fields if needed
- [ ] `src/features/theme/registry.ts`: complete `ThemeConfig`
- [ ] `src/features/identity/avatars.ts`: no new hardcoded theme branch unless unavoidable
- [ ] `src/features/room/fun.ts`: captions/quotes come from registry
- [ ] `src/features/room/FunLayer.tsx`: vehicle/package/easter egg art comes from registry
- [ ] `src/features/room/voting.ts`: special-card labels come from registry
- [ ] `src/routes/RoomPage.tsx`: card art and active theme use registry helpers
- [ ] Tests updated for selector labels, room summaries, owner controls, and special-card labels

## Persistence And API

For new theme IDs:

- [ ] Supabase migration allows the new theme in `room_settings_theme_valid`
- [ ] `set_room_theme` validates the new theme ID
- [ ] `roomApi.ts` schemas parse the new theme ID
- [ ] Any tests or fixtures with theme IDs include the new value where useful

## Docs

- [ ] `docs/development/themes.md`: registry fields, asset inventory, add-theme notes
- [ ] `ASSET_NOTICES.md`: sources and licensing
- [ ] `README.md`: only if public behavior or docs routing changed
- [ ] `docs/product/easter-eggs-and-animation.md`: only if trigger behavior or user-facing semantics changed
- [ ] `docs/architecture/data-model.md`: only if persisted theme shape changed

## Search Terms Before Completion

- [ ] Existing theme IDs: `futurama`, `zootopia`
- [ ] Current brand terms: `Planet Express`, `Zootopia`
- [ ] Current character terms: `Bender`, `Fry`, `Leela`, `Nibbler`, `Lrrr`, `Hypnotoad`, `Judy`, `Nick`, `Flash`, `Mr. Big`
- [ ] Generic terms likely to hide hardcoded theme copy: `ship`, `delivery`, `patrol`, `coffee`, `consensus`

## Validation

- [ ] Run validation from `docs/development/themes.md`
