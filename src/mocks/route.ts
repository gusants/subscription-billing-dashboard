import { delay, HttpResponse } from 'msw'
import { z } from 'zod'
import { DemoApiError } from './db/demo-api-error'
import { demoDbStore } from './db/demo-db-store'

const MIN_LATENCY_MS = 300
const MAX_LATENCY_MS = 700
const HTTP_OK = 200
const HTTP_NO_CONTENT = 204

type RouteResult = {
  status?: number
  body?: unknown
  headers?: Record<string, string>
}

type RouteContext = {
  request: Request
  params: Record<string, string | readonly string[] | undefined>
}

function simulatedLatency() {
  if (import.meta.env.MODE === 'test') return Promise.resolve()
  return delay(
    MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS),
  )
}

function errorResponse(
  statusCode: number,
  message: string,
  details?: unknown[],
) {
  const body = new DemoApiError(statusCode, message).toBody()
  return HttpResponse.json(details ? { ...body, details } : body, {
    status: statusCode,
  })
}

export function route(
  handler: (context: RouteContext) => RouteResult | Promise<RouteResult>,
) {
  return async (context: RouteContext) => {
    await simulatedLatency()
    if (demoDbStore.getState().isFailingRequests) {
      return errorResponse(
        503,
        'Simulated API error. Turn it off in the simulator.',
      )
    }
    try {
      const { status = HTTP_OK, body, headers } = await handler(context)
      return status === HTTP_NO_CONTENT
        ? new HttpResponse(null, { status, headers })
        : HttpResponse.json(body as never, { status, headers })
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

export function param(context: RouteContext, name: string) {
  const value = context.params[name]
  return typeof value === 'string' ? value : ''
}

export function searchParams(context: RouteContext) {
  return Object.fromEntries(new URL(context.request.url).searchParams)
}
