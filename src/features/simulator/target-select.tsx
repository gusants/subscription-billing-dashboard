type TargetSelectProps = {
  name: string
  label: string
  options: { id: string; label: string }[]
  emptyLabel: string
}

export function TargetSelect({
  name,
  label,
  options,
  emptyLabel,
}: TargetSelectProps) {
  if (options.length === 0)
    return <p className="text-fg-subtle text-xs">{emptyLabel}</p>

  return (
    <label className="flex flex-col gap-1 text-xs font-medium">
      {label}
      <select
        name={name}
        className="border-border bg-surface text-fg hover:border-border-strong h-8 rounded-md border px-2 text-sm font-normal"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
