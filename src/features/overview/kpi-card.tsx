import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { ReactNode } from 'react'

export type KpiDelta = {
  text: string
  direction: 'up' | 'down' | 'flat'
  isGood: boolean
}

type KpiCardProps = {
  label: string
  value: string
  delta: KpiDelta | undefined
  comparison: string
  footnote?: ReactNode
}

const directionIcon = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus }

function deltaClass(delta: KpiDelta) {
  if (delta.direction === 'flat') return 'text-fg-muted'
  return delta.isGood ? 'text-success' : 'text-danger'
}

export function KpiCard({
  label,
  value,
  delta,
  comparison,
  footnote,
}: KpiCardProps) {
  const DeltaIcon = delta ? directionIcon[delta.direction] : null

  return (
    <div className="border-border bg-surface flex flex-col gap-2 rounded-lg border px-4 py-4">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="flex flex-col gap-1.5">
        <span className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {delta && DeltaIcon && (
          <span className="flex flex-wrap items-center gap-x-1.5 text-xs">
            <span
              className={`inline-flex items-center gap-0.5 font-medium tabular-nums ${deltaClass(delta)}`}
            >
              <DeltaIcon aria-hidden size={14} strokeWidth={2} />
              {delta.text}
            </span>
            <span className="text-fg-subtle">{comparison}</span>
          </span>
        )}
        {footnote && <span className="text-fg-subtle text-xs">{footnote}</span>}
      </dd>
    </div>
  )
}
