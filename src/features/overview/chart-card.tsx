import type { ReactNode } from 'react'

type ChartCardProps = {
  title: string
  description: string
  summary: string
  table: ReactNode
  children: ReactNode
}

export function ChartCard({
  title,
  description,
  summary,
  table,
  children,
}: ChartCardProps) {
  const headingId = `${title.toLowerCase().replaceAll(' ', '-')}-heading`

  return (
    <section
      aria-labelledby={headingId}
      className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-4"
    >
      <header className="flex flex-col gap-0.5">
        <h2 id={headingId} className="font-semibold">
          {title}
        </h2>
        <p className="text-fg-muted">{description}</p>
      </header>
      <p className="sr-only">{summary}</p>
      <div aria-hidden>{children}</div>
      <details className="group text-fg-muted">
        <summary className="hover:text-fg cursor-default select-none">
          View as table
        </summary>
        <div className="mt-2 overflow-x-auto">{table}</div>
      </details>
    </section>
  )
}
