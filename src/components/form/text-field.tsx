import {
  FieldError,
  Input,
  Label,
  Text,
  TextField as AriaTextField,
} from 'react-aria-components'
import { firstErrorMessage } from './field-errors'
import { useFieldContext } from './form-context'

type TextFieldProps = {
  label: string
  description?: string
  type?: 'text' | 'email'
  inputMode?: 'text' | 'decimal' | 'email'
  placeholder?: string
}

export function TextField({
  label,
  description,
  type = 'text',
  inputMode,
  placeholder,
}: TextFieldProps) {
  const field = useFieldContext<string>()
  const error = field.state.meta.isTouched
    ? firstErrorMessage(field.state.meta.errors)
    : undefined

  return (
    <AriaTextField
      name={field.name}
      type={type}
      value={field.state.value}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
      isInvalid={Boolean(error)}
      validationBehavior="aria"
      className="flex flex-col gap-1.5"
    >
      <Label className="font-medium">{label}</Label>
      <Input
        inputMode={inputMode}
        placeholder={placeholder}
        className="border-border bg-surface placeholder:text-fg-subtle hover:border-border-strong focus:border-accent data-invalid:border-danger h-9 rounded-md border px-3 transition-colors outline-none"
      />
      {description && !error && (
        <Text slot="description" className="text-fg-muted text-xs">
          {description}
        </Text>
      )}
      <FieldError className="text-danger text-xs font-medium">
        {error}
      </FieldError>
    </AriaTextField>
  )
}
