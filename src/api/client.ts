import { apiBaseUrl } from '../lib/env'
import type { ApiErrorBody } from './contract'

type QueryValue = string | number | boolean | undefined

type RequestOptions = {
  method?: 'GET' | 'POST'
  query?: Record<string, QueryValue>
  body?: unknown
}

const NO_CONTENT = 204

export class ApiError extends Error {
  readonly status: number
  readonly body: ApiErrorBody | undefined

  constructor(status: number, body: ApiErrorBody | undefined) {
    super(body?.message ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

function buildUrl(path: string, query: RequestOptions['query']) {
  const url = new URL(`${apiBaseUrl}${path}`, window.location.origin)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== '')
      url.searchParams.set(key, String(value))
  }
  return url
}

async function readErrorBody(response: Response) {
  try {
    return (await response.json()) as ApiErrorBody
  } catch {
    return undefined
  }
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const hasBody = options.body !== undefined
  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
    body: hasBody ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok)
    throw new ApiError(response.status, await readErrorBody(response))
  if (response.status === NO_CONTENT) return undefined as T
  return (await response.json()) as T
}
