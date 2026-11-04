type ChartTooltipProps = {
  active?: boolean
  label: string | undefined
  value: string | undefined
}

export function ChartTooltip({ active, label, value }: ChartTooltipProps) {
  if (!active || !label || !value) return null
  return (
    <div className="border-border bg-surface shadow-panel rounded-md border px-3 py-2">
      <p className="text-fg-muted text-xs">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  )
}
