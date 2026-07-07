# Plan: Theme System And Zootopia Pack

Goal: Turn the single-theme Futurama presentation into a reusable theme system with browser-persisted personal theme selection, owner-controlled room theme selection, realtime room sync, and a full Zootopia theme pack.

Scope:

- In
- Theme registry supporting `futurama` and `zootopia`
- Personal theme on `/`, `/rooms`, app shell, and other non-room pages via browser storage
- Room theme stored in Supabase `room_settings`, editable by owner at any time
- Realtime room theme sync for all joined participants
- Room cards showing each room's current theme
- Full content remap for Zootopia: brand, avatars, card art, reactions, captions, copy, fun labels, favicon/logo, docs/notices
- Out
- Changing special-card semantics
- Account-level synced preferences
- More than two shipped themes in this slice

Acceptance:

- User-selected personal theme persists across reloads and across non-room pages
- Owner-selected room theme persists in DB and updates live for everyone in the room
- Non-owners cannot change room theme
- Pre-join room experience stays on the viewer's personal theme; joined room switches to room theme
- Saved room listings expose each room's active theme
- Futurama remains intact as one theme pack; Zootopia ships as a second complete pack
- Existing room flow, voting, reveal, fun effects, and owner rules keep working

Assumptions:

- Personal theme stays in browser storage only
- Room theme belongs in `room_settings`
- Existing fun-event codes can remain stable unless a code rename materially simplifies theming

Tasks:

- [T1] Theme inventory and content map
- Files/Areas: `docs/development/themes.md`, `src/app`, `src/routes`, `src/features/identity`, `src/features/room`, `public/`, tests, notices/docs
- Depends on: none
- Parallel: yes
- Validation: repo search for `Planet Express|Futurama|Hypnotoad|ship|delivery|Bender|Fry|Leela|Nibbler|Lrrr`

- [T2] Build the theme domain and browser preference layer
- Files/Areas: new theme registry module under `src/features/theme/`, `src/features/identity/storage.ts`, `src/styles/index.css`, `src/app/App.tsx`, app route wrappers as needed
- Depends on: T1
- Parallel: partial
- Validation: unit tests for personal-theme read/write/fallback; manual check `/` and `/rooms` persist theme after reload

- [T3] Persist room theme in Supabase and expose it in app types/APIs
- Files/Areas: `supabase/migrations/*`, `src/features/room/types.ts`, `src/features/room/data/roomApi.ts`, `src/features/room/realtime/useRoomSettingsLiveState.ts`, room summary RPC/selects
- Depends on: T1
- Parallel: partial
- Validation: migration applies cleanly; `room_settings` returns `theme`; room summaries include theme; live subscription reflects updates

- [T4] Add owner room-theme controls and page-wide theme switching behavior
- Files/Areas: `src/routes/HomePage.tsx`, `src/routes/RoomsPage.tsx`, `src/routes/RoomPage.tsx`, app shell components
- Depends on: T2, T3
- Parallel: no
- Validation: set personal theme on `/`, confirm `/rooms` matches; join room, confirm switch to room theme after join; owner changes theme, all joined clients update live; non-owner sees disabled/read-only state

- [T5] Move theme-specific content behind the registry
- Files/Areas: `src/features/identity/avatars.ts`, `src/features/room/fun.ts`, `src/features/room/FunLayer.tsx`, `src/features/room/voting.ts`, `src/app/AppErrorBoundary.tsx`, `index.html`, theme assets in `public/`
- Depends on: T2
- Parallel: partial
- Validation: Futurama renders from config only; no hardcoded single-theme assets remain in active UI paths

- [T6] Add the Zootopia theme pack and source local assets
- Files/Areas: `public/themes/zootopia/**` or equivalent, theme registry entries, `ASSET_NOTICES.md`, `LICENSE.md`, `README.md`, product docs as needed
- Depends on: T5
- Parallel: no
- Validation: all mapped assets local and referenced through config; notices updated for source/licensing boundaries

- [T7] Update tests and run validation gates
- Files/Areas: integration/unit tests touching labels, room settings, room cards, theme selectors, realtime behavior
- Depends on: T3, T4, T5, T6
- Parallel: no
- Validation: `npm.cmd test`, targeted integration tests, `npm.cmd run test:e2e` if env is available, manual browser smoke on `/`, `/rooms`, `/rooms/<name>`, `/rooms/<name>/dev`

Review:

- Highest-risk areas are schema migration, owner-only room theme mutation, and avoiding theme flicker when switching from personal theme to room theme after join.
- The cleanest structure is a single theme registry that owns copy, colors, logo art, avatars, card art, reaction catalog, and fun captions.

Final Validation:

- `npm.cmd test`
- `npm.cmd run test:e2e` when Supabase env is usable
- Manual checks on two browsers/tabs for realtime room theme switching
- Manual search to confirm no unintended hardcoded Futurama strings remain in live product UI

Leftovers:

- Optional later improvement: lazy-load heavy GIF/video theme assets per theme
- Optional later improvement: per-theme favicon/meta updates at runtime if desired
