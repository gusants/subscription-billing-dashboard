import type { AnyFormApi } from '@tanstack/react-form'
import { fieldErrorsOf } from '../../api/error-messages'

export function showServerFieldErrors(
  formApi: AnyFormApi,
  error: unknown,
  fieldNames?: Readonly<Record<string, string>>,
) {
  const errors = fieldErrorsOf(error, fieldNames)
  for (const [field, message] of Object.entries(errors)) {
    formApi.setFieldMeta(field, (meta) => ({
      ...meta,
      isTouched: true,
      errorMap: { ...meta.errorMap, onSubmit: message },
    }))
  }
}
