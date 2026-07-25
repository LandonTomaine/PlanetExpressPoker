# Add Theme Pack Checklist

Use this checklist for adding a new built-in theme.

## Approved Plan

- [ ] User confirmed the plan before sourcing or implementation
- [ ] Exact allowed source domains recorded; no substitute domains used
- [ ] Asset inventory maps every registry slot to a character/object/emotion
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

## Sourcing

- [ ] User is providing assets, or Codex is explicitly sourcing candidates
- [ ] Candidates kept outside `public/` and the tracked workspace
- [ ] Requests made serially; downloads reused; site rate limits and `Retry-After` honored
- [ ] Candidate manifest records exact page URL, intended slot, format, rights note, dimensions, bytes, and animation frame count
- [ ] Visual candidates shown to the user and approved before integration
- [ ] Missing high-quality matches remain unresolved instead of being replaced by another site or invented media

## Asset Quality

- [ ] New theme assets live under `public/themes/<theme-id>/`
- [ ] Asset formats preserved unless approved otherwise
- [ ] No external media is hotlinked
- [ ] File sizes remain reasonable for Cloudflare Pages
- [ ] `ASSET_NOTICES.md` records exact source URLs and license/permission notes
- [ ] Card art preserves meaning before theme flavor
- [ ] Reactions fit the trigger emotion
- [ ] Each avatar is a distinct, accurate character SVG—not a wordmark, silhouette, logo, or generic approximation
- [ ] Avatar SVGs contain no scripts, event handlers, JavaScript URLs, or external media references
- [ ] Avatar faces/bodies are recognizable at home-roster and compact room-icon sizes
- [ ] Per-avatar scaling stays inside the icon container without clipping
- [ ] Every required GIF parses as animated and contains more than one frame
- [ ] Reveal media is mapped by emotion: consensus, wide spread, N/A, question, BIG, and special cases
- [ ] Required reveal slots are not padded with a tiny set of repetitive or unrelated GIFs
- [ ] Vehicle/infinity art and package art visibly perform their animation roles
- [ ] Logo, favicon, special-card art, and avatar crops render without broken or transparent-empty output

## Registry And Code

- [ ] `src/features/theme/types.ts`: new `ThemeId` and config fields if needed
- [ ] `src/features/theme/registry.ts`: complete `ThemeConfig`
- [ ] `src/features/identity/avatars.ts`: no new hardcoded theme branch unless unavoidable
- [ ] `src/features/room/fun.ts`: captions/quotes come from registry
- [ ] `src/features/room/FunLayer.tsx`: vehicle/package/easter egg art comes from registry
- [ ] `src/features/room/voting.ts`: special-card labels come from registry
- [ ] `src/routes/RoomPage.tsx`: card art and active theme use registry helpers
- [ ] Tests updated for selector labels, room summaries, owner controls, and special-card labels
- [ ] Page appearance, new-room theme, and joined-room theme controls remain visually and semantically distinct
- [ ] Registry tests assert distinct avatar paths/labels, local asset paths, expected vehicle/card mappings, and animated reaction coverage

## Persistence And API

For new theme IDs:

- [ ] Supabase migration allows the new theme in `room_settings_theme_valid`
- [ ] `set_room_theme` validates the new theme ID
- [ ] `roomApi.ts` schemas parse the new theme ID
- [ ] Any tests or fixtures with theme IDs include the new value where useful
- [ ] Local migrations applied before backend validation
- [ ] A real room can be created and joined as owner
- [ ] A second participant can join without console, API, schema, or realtime errors
- [ ] Theme persists after reload and stale `createTheme` URLs do not retheme existing rooms
- [ ] Owner can change room theme; non-owner sees the disabled room-theme control

## Docs

- [ ] `docs/development/themes.md`: registry fields, asset inventory, add-theme notes
- [ ] `ASSET_NOTICES.md`: sources and licensing
- [ ] `README.md`: only if public behavior or docs routing changed
- [ ] `docs/product/easter-eggs-and-animation.md`: only if trigger behavior or user-facing semantics changed
- [ ] `docs/architecture/data-model.md`: only if persisted theme shape changed

## Search Terms Before Completion

- [ ] Existing theme IDs: `futurama`, `toy-story`, `zootopia`
- [ ] Current brand terms: `Planet Express`, `Toy Story`, `Zootopia`
- [ ] Current character terms include `Bender`, `Fry`, `Leela`, `Buzz`, `Woody`, `Forky`, `Judy`, `Nick`, `Flash`, and `Mr. Big`
- [ ] Generic terms likely to hide hardcoded theme copy: `ship`, `delivery`, `patrol`, `coffee`, `consensus`

## Validation

- [ ] `node .agents/skills/add-theme-pack/scripts/audit-theme-assets.mjs <theme-id>` passes with no missing, unsafe, static-GIF, or unreferenced files
- [ ] For legacy diagnosis only, `--allow-unreferenced` converts existing extra-file failures to warnings; never use it to approve a new pack
- [ ] Run validation from `docs/development/themes.md`
- [ ] Browser-check `/`, `/rooms`, real pre-join/joined room, owner and non-owner states, and `/rooms/<room>/dev`
- [ ] Trigger numeric reveal, consensus, wide spread, N/A, question, BIG, vehicle fly-by, package drop, and any theme-specific special case
- [ ] Inspect console/network logs for join failures, schema errors, and failed media requests
- [ ] Inspect avatars at both large home-roster and smallest room-icon sizes
- [ ] Post screenshots in chat: home treatment, join/roster icons, and revealed animated reaction
- [ ] User approves screenshots before push
- [ ] `git status` and staged diff contain no rejected candidates, scratch downloads, or unreferenced assets
- [ ] `public/themes/<theme-id>/` contains only approved, referenced files
