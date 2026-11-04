import { X } from 'lucide-react'
import { Button, Heading } from 'react-aria-components'
import { useUiPreferences } from '../../lib/ui-preferences'

const simulatorEvents = [
  { label: 'Approve Pix', detail: 'Settles the oldest pending Pix charge' },
  { label: 'Expire boleto', detail: 'Moves an open boleto past its due date' },
  {
    label: 'Force card decline',
    detail: 'Next card attempt returns a decline',
  },
  {
    label: 'Advance retry clock',
    detail: 'Runs retries scheduled for the next day',
  },
]

export function SimulatorPanel() {
  const setSimulatorOpen = useUiPreferences((state) => state.setSimulatorOpen)

  return (
    <>
      <div
        aria-hidden
        onClick={() => setSimulatorOpen(false)}
        className="bg-fg/30 fixed inset-0 z-10 lg:hidden"
      />
      <aside
        aria-labelledby="simulator-heading"
        className="border-border bg-surface shadow-panel fixed inset-y-0 right-0 z-20 flex w-[min(20rem,100vw)] flex-col border-l lg:sticky lg:top-0 lg:h-dvh lg:shadow-none"
      >
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <Heading id="simulator-heading" level={2} className="font-semibold">
            Simulator
          </Heading>
          <Button
            aria-label="Close simulator"
            onPress={() => setSimulatorOpen(false)}
            className="text-fg-subtle hover:bg-surface-muted hover:text-fg grid size-7 cursor-default place-items-center rounded-md transition-colors"
          >
            <X aria-hidden size={16} strokeWidth={1.75} />
          </Button>
        </div>
        <div className="flex flex-col gap-4 px-5 py-4">
          <p className="text-fg-muted">
            Trigger billing events and watch every screen react. Available once
            demo mode is on.
          </p>
          <ul className="flex flex-col gap-2">
            {simulatorEvents.map((event) => (
              <li key={event.label}>
                <Button
                  isDisabled
                  className="border-border hover:border-border-strong flex w-full cursor-default flex-col items-start rounded-lg border px-3 py-2.5 text-left transition-colors data-disabled:opacity-60"
                >
                  <span className="font-medium">{event.label}</span>
                  <span className="text-fg-muted text-xs">{event.detail}</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  )
}
