# Easter Eggs And Animation Rules

This app has optional theme-specific reactions layered on top of the core planning poker flow.

## Global Rules

- Fun reactions require the room fun level to be `chaotic`.
- If effects are disabled, voting, reveal, score summary, and room controls still work normally.
- Reactions should not move core controls or score results around.
- A GIF/reaction and a quote should not appear for the same reveal moment.
- Round reactions are cosmetic only. They must not affect votes, roles, reveal state, or score summary.

## Card Labels

Special cards store stable internal values, but the UI should display theme-specific artwork and estimation meanings:

- `ship`: infinity / unbounded
- `BIG`: very large estimate
- `nibbler`: unknown / question
- `coffee`: not applicable

These non-numeric cards are excluded from average and recommendation calculations.

## Reveal Reaction Priority

When a round is revealed, the app picks at most one reveal reaction in this order:

1. 100th-round milestone: the theme vehicle flies around with celebration effects for 10 seconds.
2. All four special cards are present: `ship`, `BIG`, `nibbler`, and `coffee` trigger a theme vehicle stunt.
3. At least one `coffee` card: random coffee GIF.
4. At least one `nibbler` card: theme unknown/question GIF.
5. At least one `ship` card: theme vehicle fly-by.
6. At least one `BIG` card: theme large-estimate GIF.
7. Matching numeric consensus: random consensus GIF. The reveal transaction stores the selected GIF so every browser sees the same consensus reaction and the room avoids immediately repeating the prior reaction when multiple options are available.
8. Exact Fibonacci spread of 2 to 4 consecutive numeric cards, such as `0,1,2,3`, `1,2,3,5`, or `2,3,5,8`: random spread GIF.
9. Numeric votes more than one card apart: random spread GIF.

Higher-priority reactions override lower-priority reactions for the same reveal.

## Manual And Secret Triggers

- Manual fun button: manually triggers the theme vehicle animation and package/prop drop.
- Keyboard vehicle stunt: while joined to a chaotic room, press `Up`, `Down`, `Left`, `Right`, `A`, `B`, `Up`, `Down` within 4 seconds. The vehicle flies around the viewport without dropping packages, faces the direction it is moving, and pitches up or down as it changes altitude.
- Logo secret: click the top-left site logo 10 times within 4.2 seconds. The room enforces a 1-hour cooldown.

The top-left logo should not visually advertise itself as clickable; keep the default cursor.

For current theme registry fields and asset mappings, see [../development/themes.md](../development/themes.md).
