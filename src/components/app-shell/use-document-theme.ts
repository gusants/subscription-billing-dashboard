import { useEffect } from 'react'
import { useUiPreferences } from '../../lib/ui-preferences'

export function useDocumentTheme() {
  const theme = useUiPreferences((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      delete root.dataset.theme
    } else {
      root.dataset.theme = theme
    }
  }, [theme])
}
