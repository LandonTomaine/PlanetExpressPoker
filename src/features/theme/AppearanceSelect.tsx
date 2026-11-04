import type { Appearance } from './types'

type AppearanceSelectProps = {
  label: string
  onChange: (appearance: Appearance) => void
  value: Appearance
}

export function AppearanceSelect({
  label,
  onChange,
  value,
}: AppearanceSelectProps) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-[var(--pep-accent)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as Appearance)}
        className="mt-2 w-full rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-4 py-3 text-base text-[var(--pep-ink)] outline-none transition focus:border-[var(--pep-accent-2)]"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  )
}
