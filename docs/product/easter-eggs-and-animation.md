# Easter Eggs And Animation Rules

This app has optional Futurama-themed reactions layered on top of the core planning poker flow.

## Global Rules

- Fun reactions require the room fun level to be `chaotic`.
- If effects are disabled, voting, reveal, score summary, and room controls still work normally.
- Reactions should not move core controls or score results around.
- A GIF/reaction and a quote should not appear for the same reveal moment.
- Round reactions are cosmetic only. They must not affect votes, roles, reveal state, or score summary.

## Card Labels

Special cards store stable internal values, but the UI should display estimation meanings:

- Planet Express ship: `∞`
- Lrrr: `BIG`
- Nibbler: `?`
- Coffee cup: `N/A`

These non-numeric cards are excluded from average and recommendation calculations.

## Reveal Reaction Priority

When a round is revealed, the app picks at most one reveal reaction in this order:

1. 100th-round milestone: Planet Express ship flies around with celebration effects for 10 seconds.
2. All four special cards are present: ship, Lrrr, Nibbler, and coffee trigger a ship stunt.
3. At least one coffee card: random coffee GIF.
4. At least one Nibbler card: Nibbler `?` GIF.
5. At least one ship card: Planet Express fly-by.
6. At least one Lrrr card: skeptical Fry GIF.
7. Matching numeric consensus: random consensus GIF, including Hypnotoad. The same browser avoids immediately repeating the prior consensus GIF when multiple options are available.
8. Exact Fibonacci spread of 2 to 4 consecutive numeric cards, such as `0,1,2,3`, `1,2,3,5`, or `2,3,5,8`: random spread GIF.
9. Numeric votes more than one card apart: random spread GIF.

Higher-priority reactions override lower-priority reactions for the same reveal.

## Manual And Secret Triggers

- `Request Planet Express delivery`: manually triggers a ship delivery animation and package drop.
- Keyboard ship stunt: while joined to a chaotic room, press `Up`, `Down`, `Left`, `Right`, `A`, `B`, `Up`, `Down` within 4 seconds. The ship flies around the viewport without dropping packages, faces the direction it is moving, and pitches up or down as it changes altitude.
- Hypnotoad logo secret: click the top-left Planet Express site logo 10 times within 4.2 seconds. The room enforces a 1-hour cooldown.

The top-left logo should not visually advertise itself as clickable; keep the default cursor.
