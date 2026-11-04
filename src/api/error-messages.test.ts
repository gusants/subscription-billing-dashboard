import { ApiError, NETWORK_ERROR_STATUS } from './client'
import {
  describeError,
  fieldErrorsOf,
  isFieldValidationError,
} from './error-messages'

function apiError(status: number, message: string, details?: unknown[]) {
  return new ApiError(status, {
    statusCode: status,
    error: 'Error',
    message,
    details,
  })
}

const validationError = apiError(400, 'Validation failed', [
  { code: 'too_small', path: ['amountCents'], message: 'Must be positive' },
  { code: 'invalid_format', path: ['name'], message: 'Name is required' },
  { code: 'custom', path: ['name'], message: 'Name is taken' },
  { code: 'custom', path: [], message: 'Body is invalid' },
  'not an issue',
])

describe('describeError', () => {
  it('explains an unreachable API', () => {
    expect(
      describeError(new ApiError(NETWORK_ERROR_STATUS, undefined)).title,
    ).toBe('Can’t reach the API')
  })

  it('explains an endpoint the connected API does not have', () => {
    expect(
      describeError(apiError(404, 'Cannot GET /customers/cus_1/summary')),
    ).toEqual({
      title: 'Not available yet',
      detail: 'The connected payments API does not offer this yet.',
    })
    expect(describeError(apiError(404, 'Customer cus_1 not found'))).toEqual({
      title: 'Action failed',
      detail: 'Customer cus_1 not found',
    })
  })

  it('lists validation messages', () => {
    expect(describeError(validationError)).toEqual({
      title: 'Some fields need attention',
      detail: 'Must be positive Name is required Name is taken Body is invalid',
    })
    expect(describeError(apiError(400, 'Bad query')).detail).toBe('Bad query')
  })

  it('gives idempotency conflicts their own wording', () => {
    expect(
      describeError(
        apiError(
          409,
          'A request with this Idempotency-Key is still being processed',
        ),
      ).title,
    ).toBe('Still being processed')
    expect(
      describeError(
        apiError(
          422,
          'Idempotency-Key was already used with a different request',
        ),
      ).title,
    ).toBe('Request already sent')
  })

  it('keeps the API message for other failures', () => {
    expect(describeError(apiError(409, 'Already canceled'))).toEqual({
      title: 'Action failed',
      detail: 'Already canceled',
    })
    expect(describeError(apiError(503, 'Database down'))).toEqual({
      title: 'The API is unavailable',
      detail: 'Database down',
    })
    expect(describeError(new Error('')).detail).toBe('Try again in a moment.')
  })
})

describe('fieldErrorsOf', () => {
  it('maps the first issue of each API field onto form fields', () => {
    expect(fieldErrorsOf(validationError, { amountCents: 'price' })).toEqual({
      price: 'Must be positive',
      name: 'Name is required',
    })
  })

  it('ignores errors that are not validation failures', () => {
    expect(fieldErrorsOf(apiError(409, 'Conflict'))).toEqual({})
    expect(fieldErrorsOf(new Error('boom'))).toEqual({})
  })

  it('tells when an error belongs on form fields', () => {
    expect(isFieldValidationError(validationError)).toBe(true)
    expect(isFieldValidationError(apiError(400, 'Validation failed'))).toBe(
      false,
    )
  })
})
