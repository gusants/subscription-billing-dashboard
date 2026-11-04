import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components'
import {
  isThemePreference,
  useUiPreferences,
  type ThemePreference,
} from '../../lib/ui-preferences'

const themeOptions: { id: ThemePreference; label: string; icon: LucideIcon }[] =
  [
    { id: 'system', label: 'System theme', icon: Monitor },
    { id: 'light', label: 'Light theme', icon: Sun },
    { id: 'dark', label: 'Dark theme', icon: Moon },
  ]

export function ThemeSwitcher() {
  const theme = useUiPreferences((state) => state.theme)
  const setTheme = useUiPreferences((state) => state.setTheme)

  return (
    <ToggleButtonGroup
      aria-label="Theme"
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[theme]}
      onSelectionChange={(keys) => {
        const [selected] = keys
        if (isThemePreference(selected)) setTheme(selected)
      }}
      className="border-border bg-surface-muted inline-flex rounded-lg border p-0.5"
    >
      {themeOptions.map(({ id, label, icon: Icon }) => (
        <ToggleButton
          key={id}
          id={id}
          aria-label={label}
          className="text-fg-subtle hover:text-fg data-selected:bg-surface data-selected:text-fg grid size-7 cursor-default place-items-center rounded-md transition-colors data-selected:shadow-[0_1px_2px_var(--shadow-color)]"
        >
          <Icon aria-hidden size={15} strokeWidth={1.75} />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
