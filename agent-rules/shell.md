# Shell Rules

These rules apply to shell usage in this repository's Windows environment.

## PowerShell

- Do not use `&&` as a command separator in PowerShell.
- Run sequential commands as separate calls unless native PowerShell control flow is required.
- Prefer native PowerShell syntax over `cmd` workarounds.
- Hash literal keys are case-insensitive. Do not use keys that differ only by case, such as `PathLength` and `PATHLength`.
- Parenthesize ranges before passing them as command arguments or indexes, for example `$lines[74..84]` or `($items[0..3])`.
- When passing coordinate pairs or similar structured values through a pipeline, prefer `[pscustomobject]` records with named properties over nested arrays; PowerShell may flatten nested arrays in surprising ways.
- When converting .NET collections, prefer PowerShell-native enumeration such as `@($hashSet)` over extension-method assumptions such as `$hashSet.ToArray()`.

## Command Choice

- Prefer `rg` for file and text search when available.
- Use focused commands instead of broad directory dumps.
- Read only the files needed for the current task.

## Long-Running Commands

- Use explicit, bounded timeouts for formatters, validators, and hooks.
- If a formatter or validator hangs, times out, or is interrupted once, do not rerun the same full command blindly.
- First check for orphaned processes, stop only the process you started, then use a narrower command or targeted fix.
- If a formatting or validation command fails because of line-ending drift, normalize only the touched files to the repo's configured line ending before rerunning a verify command.

## Safety

- Be careful with destructive commands.
- Verify paths before file moves or deletes.
- Ask before destructive actions covered by [core.md](core.md).
