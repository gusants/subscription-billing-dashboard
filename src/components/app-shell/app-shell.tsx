import type { ReactNode } from 'react'
import { useUiPreferences } from '../../lib/ui-preferences'
import { Sidebar } from './sidebar'
import { SimulatorPanel } from '../../features/simulator/simulator-panel'
import { useDocumentTheme } from './use-document-theme'

export function AppShell({ children }: { children: ReactNode }) {
  useDocumentTheme()
  const isSimulatorOpen = useUiPreferences((state) => state.isSimulatorOpen)

  return (
    <div className="bg-canvas text-fg min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <a
        href="#main-content"
        className="bg-accent text-accent-fg fixed top-2 left-2 z-30 -translate-y-16 rounded-md px-3 py-2 font-medium transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0">
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[90rem] min-w-0 flex-1 px-4 py-6 outline-none sm:px-6 lg:px-10 lg:py-8"
        >
          {children}
        </main>
        {isSimulatorOpen && <SimulatorPanel />}
      </div>
    </div>
  )
}
