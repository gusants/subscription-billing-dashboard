import { Check, ChevronDown } from 'lucide-react'
import {
  Button,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from 'react-aria-components'
import { firstErrorMessage } from './field-errors'
import { useFieldContext } from './form-context'

type SelectFieldProps = {
  label: string
  placeholder: string
  options: readonly { id: string; label: string }[]
}

export function SelectField({ label, placeholder, options }: SelectFieldProps) {
  const field = useFieldContext<string>()
  const error = field.state.meta.isTouched
    ? firstErrorMessage(field.state.meta.errors)
    : undefined

  return (
    <Select
      name={field.name}
      placeholder={placeholder}
      value={field.state.value || null}
      onChange={(key) => field.handleChange(key === null ? '' : String(key))}
      onBlur={field.handleBlur}
      isInvalid={Boolean(error)}
      validationBehavior="aria"
      className="flex flex-col gap-1.5"
    >
      <Label className="font-medium">{label}</Label>
      <Button className="border-border bg-surface hover:border-border-strong data-pressed:border-accent group-data-invalid:border-danger flex h-9 cursor-default items-center justify-between gap-2 rounded-md border px-3 text-left transition-colors">
        <SelectValue className="data-placeholder:text-fg-subtle truncate" />
        <ChevronDown
          aria-hidden
          size={15}
          strokeWidth={1.75}
          className="text-fg-subtle"
        />
      </Button>
      <FieldError className="text-danger text-xs font-medium">
        {error}
      </FieldError>
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
    </Select>
  )
}
