import '@testing-library/jest-dom/vitest'
import { useUiPreferences } from '../lib/ui-preferences'
import { demoDbStore } from '../mocks/db/demo-db-store'
import { server } from '../mocks/node'

const initialUiPreferences = useUiPreferences.getState()

window.scrollTo = () => undefined

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))

afterEach(() => {
  server.resetHandlers()
  demoDbStore.getState().reset()
  demoDbStore.getState().setFailingRequests(false)
  localStorage.clear()
  useUiPreferences.setState(initialUiPreferences, true)
  delete document.documentElement.dataset.theme
})

afterAll(() => server.close())
