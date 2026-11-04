import { Switch } from 'react-aria-components'

type DemoSwitchProps = {
  label: string
  description: string
  isSelected: boolean
  isDisabled?: boolean
  onChange: (isSelected: boolean) => void
}

export function DemoSwitch({
  label,
  description,
  isSelected,
  isDisabled = false,
  onChange,
}: DemoSwitchProps) {
  return (
    <Switch
      isSelected={isSelected}
      isDisabled={isDisabled}
      onChange={onChange}
      className="group border-border flex cursor-default items-center justify-between gap-3 rounded-lg border p-3 data-disabled:[&>span:last-child]:opacity-50"
    >
      <span className="flex flex-col">
        <span className="font-medium">{label}</span>
        <span className="text-fg-muted text-xs">{description}</span>
      </span>
      <span className="bg-border-strong group-data-selected:bg-danger flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors">
        <span className="bg-surface size-4 rounded-full shadow-[0_1px_2px_var(--shadow-color)] transition-transform group-data-selected:translate-x-4" />
      </span>
    </Switch>
  )
}
