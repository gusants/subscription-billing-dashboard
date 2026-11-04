import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext } from './form-context'
import { RadioCardsField } from './radio-cards-field'
import { SelectField } from './select-field'
import { SubmitButton } from './submit-button'
import { TextField } from './text-field'

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, SelectField, RadioCardsField },
  formComponents: { SubmitButton },
})
