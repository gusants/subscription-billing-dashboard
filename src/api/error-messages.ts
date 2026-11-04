import { z } from 'zod'
import { ApiError, NETWORK_ERROR_STATUS } from './client'

const HTTP_BAD_REQUEST = 400
const HTTP_NOT_FOUND = 404
const HTTP_CONFLICT = 409
const HTTP_UNPROCESSABLE = 422
const FIRST_SERVER_ERROR_STATUS = 500
const IDEMPOTENCY_KEY_MARKER = 'Idempotency-Key'
const MISSING_ROUTE_MESSAGE = /^Cannot (GET|POST|PUT|PATCH|DELETE) \//

const validationIssueSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
})

type ValidationIssue = z.infer<typeof validationIssueSchema>

export type ErrorDescription = { title: string; detail: string }

function validationIssues(error: ApiError): ValidationIssue[] {
  return (error.body?.details ?? []).flatMap((detail) => {
    const parsed = validationIssueSchema.safeParse(detail)
    return parsed.success ? [parsed.data] : []
  })
}

function isMissingRoute(error: ApiError) {
  return (
    error.status === HTTP_NOT_FOUND && MISSING_ROUTE_MESSAGE.test(error.message)
  )
}

function isIdempotencyError(error: ApiError) {
  return error.message.includes(IDEMPOTENCY_KEY_MARKER)
}

function describeApiError(error: ApiError): ErrorDescription {
  if (error.status === NETWORK_ERROR_STATUS)
    return {
      title: 'Can’t reach the API',
      detail: 'Check that the payments API is running, then try again.',
    }
  if (isMissingRoute(error))
    return {
      title: 'Not available yet',
      detail: 'The connected payments API does not offer this yet.',
    }
  if (error.status === HTTP_BAD_REQUEST) {
    const messages = validationIssues(error).map((issue) => issue.message)
    return {
      title: 'Some fields need attention',
      detail: messages.length > 0 ? messages.join(' ') : error.message,
    }
  }
  if (error.status === HTTP_CONFLICT && isIdempotencyError(error))
    return {
      title: 'Still being processed',
      detail:
        'The first attempt of this request has not finished yet. Wait a moment and refresh before trying again.',
    }
  if (error.status === HTTP_UNPROCESSABLE && isIdempotencyError(error))
    return {
      title: 'Request already sent',
      detail:
        'This form was already submitted with different details. Close it and start over to send a new request.',
    }
  if (error.status >= FIRST_SERVER_ERROR_STATUS)
    return { title: 'The API is unavailable', detail: error.message }
  return { title: 'Action failed', detail: error.message }
}

export function describeError(error: unknown): ErrorDescription {
  if (error instanceof ApiError) return describeApiError(error)
  return {
    title: 'Something went wrong',
    detail:
      error instanceof Error && error.message
        ? error.message
        : 'Try again in a moment.',
  }
}

export function isFieldValidationError(error: unknown) {
  return (
    error instanceof ApiError &&
    error.status === HTTP_BAD_REQUEST &&
    validationIssues(error).some((issue) => issue.path.length > 0)
  )
}

export function fieldErrorsOf(
  error: unknown,
  fieldNames: Readonly<Record<string, string>> = {},
) {
  if (!(error instanceof ApiError) || error.status !== HTTP_BAD_REQUEST)
    return {}
  const errors: Record<string, string> = {}
  for (const { path, message } of validationIssues(error)) {
    const [apiField] = path
    if (typeof apiField !== 'string') continue
    const field = fieldNames[apiField] ?? apiField
    errors[field] ??= message
  }
  return errors
}
