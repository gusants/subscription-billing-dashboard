import type { ReactNode } from 'react'
import { useFlashOnChange } from '../../lib/use-flash-on-change'

export function StatCard({
  label,
  signature,
  children,
}: {
  label: string
  signature: string
  children: ReactNode
}) {
  const flash = useFlashOnChange(signature)

  return (
    <div
      data-flash={flash}
      className="border-border bg-surface flex flex-col gap-1.5 rounded-lg border px-4 py-3.5"
    >
      <dt className="text-fg-muted text-xs font-medium">{label}</dt>
      <dd className="text-[0.9375rem] font-semibold tabular-nums">
        {children}
      </dd>
    </div>
  )
}
