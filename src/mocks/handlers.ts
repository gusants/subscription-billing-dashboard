import { http } from 'msw'
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
import { demoDbStore } from './db/demo-db-store'
import { findSubscription } from './db/lookups'
import { customerSummary, metricsOverview } from './db/metrics'
import {
  customerCharges,
  customerDetail,
  listCustomers,
  listPlans,
  toPublicCharge,
  toPublicSubscription,
} from './db/queries'
import {
  clearIdempotencyKeys,
  REPLAYED_HEADER,
  withIdempotency,
} from './idempotency'
import { param, route, searchParams } from './route'
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

const url = (path: string) => `${apiBaseUrl}${path}`
const store = () => demoDbStore.getState()

export const handlers = [
  http.get(
    url('/health'),
    route(() => ({ body: { status: 'ok' } })),
  ),

  http.get(
    url('/customers'),
    route((context) => {
      const query = customerListQuery.parse(searchParams(context))
      return { body: store().read((db) => listCustomers(db, query)) }
    }),
  ),
  http.post(
    url('/customers'),
    route(async ({ request }) => {
      const input = createCustomerBody.parse(await request.json())
      return {
        status: CREATED,
        body: store().transact((db) => createCustomer(db, input)),
      }
    }),
  ),
  http.get(
    url('/customers/:id'),
    route((context) => ({
      body: store().read((db) => customerDetail(db, param(context, 'id'))),
    })),
  ),
  http.get(
    url('/customers/:id/charges'),
    route((context) => {
      const query = chargeHistoryQuery.parse(searchParams(context))
      return {
        body: store().read((db) =>
          customerCharges(db, param(context, 'id'), query),
        ),
      }
    }),
  ),
  http.get(
    url('/customers/:id/summary'),
    route((context) => ({
      body: store().read((db) => customerSummary(db, param(context, 'id'))),
    })),
  ),

  http.get(
    url('/plans'),
    route((context) => {
      const query = planListQuery.parse(searchParams(context))
      return { body: store().read((db) => listPlans(db, query)) }
    }),
  ),
  http.post(
    url('/plans'),
    route(async ({ request }) => {
      const input = createPlanBody.parse(await request.json())
      return {
        status: CREATED,
        body: store().transact((db) => createPlan(db, input)),
      }
    }),
  ),

  http.post(
    url('/subscriptions'),
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
    url('/subscriptions/:id'),
    route((context) => ({
      body: store().read((db) =>
        toPublicSubscription(findSubscription(db, param(context, 'id'))),
      ),
    })),
  ),
  http.post(
    url('/subscriptions/:id/cancel'),
    route((context) => ({
      body: store().transact((db) =>
        toPublicSubscription(cancelSubscription(db, param(context, 'id'))),
      ),
    })),
  ),

  http.post(
    url('/charges/:id/retry'),
    route((context) => ({
      body: store().transact((db) => {
        const { charge, subscription } = retryCharge(db, param(context, 'id'))
        return {
          charge: toPublicCharge(charge),
          subscription: { id: subscription.id, status: subscription.status },
        }
      }),
    })),
  ),

  http.get(
    url('/metrics/overview'),
    route((context) => {
      const query = metricsQuery.parse(searchParams(context))
      return { body: store().read((db) => metricsOverview(db, query)) }
    }),
  ),

  http.post(
    url('/fake-gateway/charges/:id/pay'),
    route((context) => {
      store().transact((db) => payInstantCharge(db, param(context, 'id')))
      return { status: NO_CONTENT }
    }),
  ),
  http.post(
    url('/fake-gateway/charges/:id/expire'),
    route((context) => {
      store().transact((db) => expireInstantCharge(db, param(context, 'id')))
      return { status: NO_CONTENT }
    }),
  ),
  http.post(
    url('/fake-gateway/subscriptions/:id/card'),
    route(async (context) => {
      const { cardToken } = setCardBody.parse(await context.request.json())
      store().transact((db) =>
        setSubscriptionCard(db, param(context, 'id'), cardToken),
      )
      return { status: NO_CONTENT }
    }),
  ),
  http.post(
    url('/fake-gateway/reset'),
    route(() => {
      store().reset()
      clearIdempotencyKeys()
      return { status: NO_CONTENT }
    }),
  ),
  http.post(
    url('/dev/retries/run-now'),
    route(() => ({ body: store().transact(runRetriesNow) })),
  ),
]
