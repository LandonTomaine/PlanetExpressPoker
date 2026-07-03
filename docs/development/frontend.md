# Frontend Standards

The frontend stack is:

- `React`
- `TypeScript`
- `Vite`
- `React Router`
- `Motion`
- `Tailwind CSS`

## Goals

- Keep the UI simple to reason about.
- Keep the room flow obvious.
- Make animation a product strength without tangling it with business logic.

## Structure

Prefer feature-oriented organization.

Suggested pattern:

- `features/room`
- `features/voting`
- `features/participants`
- `features/fun`
- `components/ui`
- `lib/supabase`

Avoid giant shared utility folders with vague ownership.

## Component Rules

- Keep components focused.
- Separate presentational UI from data wiring when the component becomes hard to read.
- Prefer composition over inheritance or configuration-heavy wrapper patterns.
- Do not introduce a state library by default.

## State Rules

Use:

- component state for local UI
- browser storage for remembered name and avatar
- Supabase-backed state for shared room truth

Avoid duplicating durable backend state into multiple frontend caches without a clear reason.

## Styling

- Use `Tailwind` for layout, spacing, and common styling.
- Use CSS variables for theme tokens such as colors, shadows, and animation accents.
- Keep the base layout readable and clean.
- Put Futurama/Planet Express flavor mostly in art, reactions, avatars, props, and animation layers.

## Animation

- Use `Motion` for meaningful transitions and reveal moments.
- Do not animate everything.
- Cosmetic chaos must be easy to disable.
- Animation state should reflect product state, not replace it.

## Accessibility

- Cards, reveal, reset, and role toggles must be keyboard reachable.
- Do not rely on color alone for vote/reveal state.
- Countdown and reveal state should remain understandable with reduced motion.
- Respect reduced-motion preferences where practical.

## Interaction Defaults

- Hidden vote state should be obvious.
- Participant role should always be visible.
- Reveal/reset controls should be visually easy to find.
- Fun actions should not obscure core voting actions.
