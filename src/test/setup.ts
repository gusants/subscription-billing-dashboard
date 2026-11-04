import '@testing-library/jest-dom/vitest'
import { useUiPreferences } from '../lib/ui-preferences'

const initialUiPreferences = useUiPreferences.getState()

afterEach(() => {
  localStorage.clear()
  useUiPreferences.setState(initialUiPreferences, true)
  delete document.documentElement.dataset.theme
})

window.scrollTo = () => undefined
