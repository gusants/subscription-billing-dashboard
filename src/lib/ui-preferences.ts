import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const themePreferences = ['system', 'light', 'dark'] as const
export type ThemePreference = (typeof themePreferences)[number]

type UiPreferences = {
  theme: ThemePreference
  isSimulatorOpen: boolean
  setTheme: (theme: ThemePreference) => void
  setSimulatorOpen: (isOpen: boolean) => void
}

export const UI_PREFERENCES_STORAGE_KEY = 'cadencia-ui-preferences'

export const useUiPreferences = create<UiPreferences>()(
  persist(
    (set) => ({
      theme: 'system',
      isSimulatorOpen: false,
      setTheme: (theme) => set({ theme }),
      setSimulatorOpen: (isSimulatorOpen) => set({ isSimulatorOpen }),
    }),
    { name: UI_PREFERENCES_STORAGE_KEY },
  ),
)

export function isThemePreference(value: unknown): value is ThemePreference {
  return themePreferences.some((theme) => theme === value)
}
