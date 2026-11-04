import {
  FieldError,
  Label,
  Radio,
  RadioGroup,
  Text,
} from 'react-aria-components'
import { firstErrorMessage } from './field-errors'
import { useFieldContext } from './form-context'

type RadioCardsFieldProps = {
  label: string
  options: readonly { id: string; label: string; description: string }[]
}

export function RadioCardsField({ label, options }: RadioCardsFieldProps) {
  const field = useFieldContext<string>()
  const error = field.state.meta.isTouched
    ? firstErrorMessage(field.state.meta.errors)
    : undefined

  return (
    <RadioGroup
      name={field.name}
      value={field.state.value}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
      isInvalid={Boolean(error)}
      validationBehavior="aria"
      className="flex flex-col gap-1.5"
    >
      <Label className="font-medium">{label}</Label>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-2">
        {options.map((option) => (
          <Radio
            key={option.id}
            value={option.id}
            className="border-border bg-surface hover:border-border-strong data-focus-visible:outline-accent data-selected:border-accent data-selected:bg-accent-soft flex cursor-default flex-col gap-0.5 rounded-md border px-3 py-2 transition-colors data-focus-visible:outline-2"
          >
            <span className="font-medium">{option.label}</span>
            <Text slot="description" className="text-fg-muted text-xs">
              {option.description}
            </Text>
          </Radio>
        ))}
      </div>
      <FieldError className="text-danger text-xs font-medium">
        {error}
      </FieldError>
    </RadioGroup>
  )
}
