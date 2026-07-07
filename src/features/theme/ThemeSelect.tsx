import { themeOptions } from './registry'
import type { ThemeId } from './types'

type ThemeSelectProps = {
  disabled?: boolean
  id?: string
  label: string
  onChange: (themeId: ThemeId) => void
  value: ThemeId
}

export function ThemeSelect({
  disabled = false,
  id,
  label,
  onChange,
  value,
}: ThemeSelectProps) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-[var(--pep-accent)]">
        {label}
      </span>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as ThemeId)}
        className="mt-2 w-full rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--pep-accent-2)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {themeOptions.map((themeOption) => (
          <option key={themeOption.id} value={themeOption.id}>
            {themeOption.label}
          </option>
        ))}
      </select>
    </label>
  )
}
