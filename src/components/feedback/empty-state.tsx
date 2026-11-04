import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="border-border-strong flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-12 text-center">
      <h2 className="font-semibold">{title}</h2>
      <p className="text-fg-muted max-w-sm">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
