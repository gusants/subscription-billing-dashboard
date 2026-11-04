import { delay, HttpResponse, type JsonBodyType } from 'msw'
import { z } from 'zod'
import type { ApiErrorBody } from '../api/contract'
import { DemoApiError } from './db/demo-api-error'
import { demoFlags } from './demo-flags'

const MIN_LATENCY_MS = 300
const MAX_LATENCY_MS = 700
const HTTP_OK = 200
const HTTP_NO_CONTENT = 204

type RouteResult<Body> = {
  status?: number
  body?: Body
  headers?: Record<string, string>
}

type Latency = { minMs: number; maxMs: number }

const DEFAULT_LATENCY: Latency = {
  minMs: MIN_LATENCY_MS,
  maxMs: MAX_LATENCY_MS,
}

function simulatedLatency({ minMs, maxMs }: Latency) {
  if (import.meta.env.MODE === 'test') return Promise.resolve()
  return delay(minMs + Math.random() * (maxMs - minMs))
}

function errorResponse(
  statusCode: number,
  message: string,
  details?: unknown[],
) {
  const body: ApiErrorBody = new DemoApiError(statusCode, message).toBody()
  const response = HttpResponse.json<ApiErrorBody>(
    details ? { ...body, details } : body,
    { status: statusCode },
  )
  return response as unknown as HttpResponse<never>
}

function noContent<Body extends JsonBodyType>(
  headers: Record<string, string> | undefined,
) {
  return new HttpResponse(null, {
    status: HTTP_NO_CONTENT,
    headers,
  }) as unknown as HttpResponse<Body>
}

export const SUMMARY_LATENCY: Latency = { minMs: 1500, maxMs: 3000 }

export function route<Info, Body extends JsonBodyType = null>(
  handler: (info: Info) => RouteResult<Body> | Promise<RouteResult<Body>>,
  latency: Latency = DEFAULT_LATENCY,
) {
  return async (info: Info): Promise<HttpResponse<Body>> => {
    await simulatedLatency(latency)
    if (demoFlags.getState().isFailingRequests) {
      return errorResponse(
        503,
        'Simulated API error. Turn it off in the simulator.',
      )
    }
    try {
      const { status = HTTP_OK, body, headers } = await handler(info)
      return status === HTTP_NO_CONTENT
        ? noContent<Body>(headers)
        : HttpResponse.json<Body>(body as Body, { status, headers })
    } catch (error) {
      if (error instanceof DemoApiError)
        return errorResponse(error.statusCode, error.message)
      if (error instanceof z.ZodError) {
        return errorResponse(
          400,
          'Validation failed',
          error.issues.map((issue) => issue.message),
        )
      }
      throw error
    }
  }
}

export function searchParams(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams)
}
