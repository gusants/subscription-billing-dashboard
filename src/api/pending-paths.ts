import type {
  CustomerSummary,
  MetricsOverview,
  MetricsOverviewParams,
  RetriesRunResult,
} from './contract'
import type { components } from './generated/schema'

type JsonResponse<Body> = {
  headers: { [name: string]: unknown }
  content: { 'application/json': Body }
}

type ErrorResponse = JsonResponse<components['schemas']['ErrorResponseDto']>

type Operation<Parameters, Body> = {
  parameters: Parameters & { header?: never; cookie?: never }
  requestBody?: never
  responses: {
    200: JsonResponse<Body>
    400: ErrorResponse
    404: ErrorResponse
  }
}

type NoParameters = { query?: never; path?: never }

type EmptyPathItem = {
  parameters: {
    query?: never
    header?: never
    path?: never
    cookie?: never
  }
  get?: never
  put?: never
  post?: never
  delete?: never
  options?: never
  head?: never
  patch?: never
  trace?: never
}

type PathItem<Method extends 'get' | 'post', Op> = Omit<
  EmptyPathItem,
  Method
> & { [key in Method]: Op }

// TODO: drop each entry once the payments API publishes it in openapi.json
export type PendingPaths = {
  '/metrics/overview': PathItem<
    'get',
    Operation<{ query?: MetricsOverviewParams; path?: never }, MetricsOverview>
  >
  '/customers/{id}/summary': PathItem<
    'get',
    Operation<{ query?: never; path: { id: string } }, CustomerSummary>
  >
  '/dev/retries/run-now': PathItem<
    'post',
    Operation<NoParameters, RetriesRunResult>
  >
}
