import { createOpenApiHttp } from 'openapi-msw'
import type { ApiPaths } from '../api/client'
import { apiBaseUrl } from '../lib/env'
import {
  cancelSubscription,
  createSubscription,
  expireInstantCharge,
  payInstantCharge,
  retryCharge,
  runRetriesNow,
  setSubscriptionCard,
} from './db/billing'
import { createCustomer, createPlan } from './db/catalog-writes'
import { customerSummary } from './db/customer-summary'
import { demoDbStore } from './db/demo-db-store'
import { findSubscription } from './db/lookups'
import { metricsOverview } from './db/metrics'
import {
  customerCharges,
  customerDetail,
  listCustomers,
  listPlans,
  toGatewayCharge,
  toPublicCharge,
  toPublicSubscription,
} from './db/queries'
import { demoFlags } from './demo-flags'
import {
  clearIdempotencyKeys,
  REPLAYED_HEADER,
  withIdempotency,
} from './idempotency'
import { route, searchParams, SUMMARY_LATENCY } from './route'
import {
  chargeHistoryQuery,
  createCustomerBody,
  createPlanBody,
  createSubscriptionBody,
  customerListQuery,
  metricsQuery,
  planListQuery,
  setCardBody,
} from './schemas'

const CREATED = 201
const NO_CONTENT = 204

const http = createOpenApiHttp<ApiPaths>({ baseUrl: apiBaseUrl })
const store = () => demoDbStore.getState()

export const handlers = [
  http.get(
    '/health',
    route(() => ({ body: { status: 'ok' as const } })),
  ),

  http.get(
    '/customers',
    route(({ request }) => {
      const query = customerListQuery.parse(searchParams(request))
      return { body: store().read((db) => listCustomers(db, query)) }
    }),
  ),
  http.post(
    '/customers',
    route(async ({ request }) => {
      const input = createCustomerBody.parse(await request.json())
      return {
        status: CREATED,
        body: store().transact((db) => createCustomer(db, input)),
      }
    }),
  ),
  http.get(
    '/customers/{id}',
    route(({ params }) => ({
      body: store().read((db) => customerDetail(db, params.id)),
    })),
  ),
  http.get(
    '/customers/{id}/charges',
    route(({ params, request }) => {
      const query = chargeHistoryQuery.parse(searchParams(request))
      return {
        body: store().read((db) => customerCharges(db, params.id, query)),
      }
    }),
  ),
  http.get(
    '/customers/{id}/summary',
    route(
      ({ params }) => ({
        body: store().read((db) =>
          customerSummary(db, params.id, {
            isLlmFailing: demoFlags.getState().isLlmFailing,
          }),
        ),
      }),
      SUMMARY_LATENCY,
    ),
  ),

  http.get(
    '/plans',
    route(({ request }) => {
      const query = planListQuery.parse(searchParams(request))
      return { body: store().read((db) => listPlans(db, query)) }
    }),
  ),
  http.post(
    '/plans',
    route(async ({ request }) => {
      const input = createPlanBody.parse(await request.json())
      return {
        status: CREATED,
        body: store().transact((db) => createPlan(db, input)),
      }
    }),
  ),

  http.post(
    '/subscriptions',
    route(async ({ request }) => {
      const rawBody = await request.text()
      const input = createSubscriptionBody.parse(JSON.parse(rawBody))
      const result = await withIdempotency(
        request.headers.get('Idempotency-Key'),
        rawBody,
        () => ({
          status: CREATED,
          body: store().transact((db) => {
            const { subscription, charge } = createSubscription(db, input)
            const failureReason =
              charge.attempts.at(-1)?.failureReason ?? undefined
            return {
              ...toPublicSubscription(subscription),
              latestCharge: {
                id: charge.id,
                amountCents: charge.amountCents,
                status: charge.status,
                failureReason,
              },
            }
          }),
        }),
      )
      return {
        status: result.status,
        body: result.body,
        headers: result.replayed ? { [REPLAYED_HEADER]: 'true' } : undefined,
      }
    }),
  ),
  http.get(
    '/subscriptions/{id}',
    route(({ params }) => ({
      body: store().read((db) =>
        toPublicSubscription(findSubscription(db, params.id)),
      ),
    })),
  ),
  http.post(
    '/subscriptions/{id}/cancel',
    route(({ params }) => ({
      body: store().transact((db) =>
        toPublicSubscription(cancelSubscription(db, params.id)),
      ),
    })),
  ),

  http.post(
    '/charges/{id}/retry',
    route(({ params }) => ({
      body: store().transact((db) => {
        const { charge, subscription } = retryCharge(db, params.id)
        return {
          charge: toPublicCharge(charge),
          subscription: { id: subscription.id, status: subscription.status },
        }
      }),
    })),
  ),

  http.get(
    '/metrics/overview',
    route(({ request }) => {
      const query = metricsQuery.parse(searchParams(request))
      return { body: store().read((db) => metricsOverview(db, query)) }
    }),
  ),

  http.post(
    '/fake-gateway/charges/{id}/pay',
    route(({ params }) => ({
      body: store().transact((db) =>
        toGatewayCharge(db, payInstantCharge(db, params.id)),
      ),
    })),
  ),
  http.post(
    '/fake-gateway/charges/{id}/expire',
    route(({ params }) => ({
      body: store().transact((db) =>
        toGatewayCharge(db, expireInstantCharge(db, params.id)),
      ),
    })),
  ),
  http.post(
    '/fake-gateway/subscriptions/{id}/card',
    route(async ({ params, request }) => {
      const { cardToken } = setCardBody.parse(await request.json())
      store().transact((db) => setSubscriptionCard(db, params.id, cardToken))
      return { status: NO_CONTENT }
    }),
  ),
  http.post(
    '/fake-gateway/reset',
    route(() => {
      store().reset()
      clearIdempotencyKeys()
      return { status: NO_CONTENT }
    }),
  ),
  http.post(
    '/dev/retries/run-now',
    route(() => ({ body: store().transact(runRetriesNow) })),
  ),
]
