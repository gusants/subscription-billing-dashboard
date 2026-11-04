import type { ActionOutcome } from './simulator-action'

export type LogEntry = { id: number; title: string; outcome: ActionOutcome }

export function SimulatorLog({ entries }: { entries: LogEntry[] }) {
  return (
    <section
      aria-labelledby="simulator-log-heading"
      className="flex flex-col gap-2"
    >
      <h3
        id="simulator-log-heading"
        className="text-fg-muted text-xs font-medium"
      >
        Recent actions
      </h3>
      {entries.length === 0 ? (
        <p className="text-fg-subtle text-xs">
          Nothing yet. Actions you run appear here.
        </p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {entries.map((entry) => (
            <li key={entry.id} className="flex gap-2 text-xs">
              <span
                aria-hidden
                className={`mt-1 size-1.5 shrink-0 rounded-full ${entry.outcome.status === 'error' ? 'bg-danger' : 'bg-success'}`}
              />
              <span>
                <span className="font-medium">{entry.title}:</span>{' '}
                <span className="text-fg-muted">{entry.outcome.message}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
