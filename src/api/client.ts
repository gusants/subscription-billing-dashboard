import createClient from 'openapi-fetch'
import { apiBaseUrl } from '../lib/env'
import type { ApiErrorBody } from './contract'
import type { paths } from './generated/schema'

export type ApiPaths = paths

export const NETWORK_ERROR_STATUS = 0

export class ApiError extends Error {
  readonly status: number
  readonly body: ApiErrorBody | undefined

  constructor(
    status: number,
    body: ApiErrorBody | undefined,
    options?: ErrorOptions,
  ) {
    super(
      body?.message ??
        (status === NETWORK_ERROR_STATUS
          ? 'The API could not be reached'
          : `Request failed with status ${status}`),
      options,
    )
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

function serializeQuery(query: Record<string, unknown>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '')
      search.set(key, String(value as string | number | boolean))
  }
  return search.toString()
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { message?: unknown }).message === 'string'
  )
}

export const api = createClient<ApiPaths>({
  baseUrl: new URL(apiBaseUrl, window.location.origin).href.replace(/\/$/, ''),
  fetch: (request) => globalThis.fetch(request),
  querySerializer: serializeQuery,
})

type ClientResult<Data> = {
  data?: Data
  error?: unknown
  response: Response
}

export async function unwrap<Data>(
  pending: Promise<ClientResult<Data>>,
): Promise<Data> {
  const { data, error, response } = await pending.catch((cause: unknown) => {
    throw new ApiError(NETWORK_ERROR_STATUS, undefined, { cause })
  })
  if (!response.ok)
    throw new ApiError(response.status, isErrorBody(error) ? error : undefined)
  return data as Data
}
