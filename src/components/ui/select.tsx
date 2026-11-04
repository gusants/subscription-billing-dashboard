import { Check, ChevronDown } from 'lucide-react'
import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
  type Key,
} from 'react-aria-components'

export type SelectOption<T extends Key> = { id: T; label: string }

type SelectProps<T extends Key> = {
  label: string
  options: readonly SelectOption<T>[]
  value: T
  onChange: (value: T) => void
  isLabelVisible?: boolean
}

export function Select<T extends Key>({
  label,
  options,
  value,
  onChange,
  isLabelVisible = false,
}: SelectProps<T>) {
  return (
    <AriaSelect
      value={value}
      onChange={(key) => {
        const option = options.find((candidate) => candidate.id === key)
        if (option) onChange(option.id)
      }}
      className="flex flex-col gap-1.5"
    >
      <Label className={isLabelVisible ? 'font-medium' : 'sr-only'}>
        {label}
      </Label>
      <Button className="border-border bg-surface hover:border-border-strong data-pressed:border-accent flex h-9 min-w-40 cursor-default items-center justify-between gap-2 rounded-md border px-3 text-left transition-colors">
        <SelectValue className="truncate" />
        <ChevronDown
          aria-hidden
          size={15}
          strokeWidth={1.75}
          className="text-fg-subtle"
        />
      </Button>
      <Popover className="border-border bg-surface shadow-panel min-w-(--trigger-width) rounded-lg border p-1 outline-none">
        <ListBox className="outline-none">
          {options.map((option) => (
            <ListBoxItem
              key={option.id}
              id={option.id}
              textValue={option.label}
              className="data-focused:bg-surface-muted flex cursor-default items-center justify-between gap-3 rounded-md px-2.5 py-1.5 outline-none data-selected:font-medium"
            >
              {({ isSelected }) => (
                <>
                  {option.label}
                  {isSelected && (
                    <Check
                      aria-hidden
                      size={14}
                      strokeWidth={2}
                      className="text-accent"
                    />
                  )}
                </>
              )}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </AriaSelect>
  )
}
