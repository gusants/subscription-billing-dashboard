type ErrorLike = { message?: unknown } | string | null | undefined

export function firstErrorMessage(errors: readonly ErrorLike[]) {
  for (const error of errors) {
    if (typeof error === 'string' && error) return error
    if (error && typeof error === 'object' && typeof error.message === 'string')
      return error.message
  }
  return undefined
}
