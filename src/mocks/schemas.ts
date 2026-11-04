import { z } from 'zod'

const MAX_PAGE = 10_000
const MAX_LIMIT = 100

const pageParams = {
  page: z.coerce.number().int().min(1).max(MAX_PAGE).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).optional(),
}

const subscriptionStatus = z.enum([
  'incomplete',
  'active',
  'past_due',
  'canceled',
])

export const customerListQuery = z.object({
  ...pageParams,
  search: z.string().min(1).optional(),
  subscriptionStatus: subscriptionStatus.optional(),
})

export const chargeHistoryQuery = z.object(pageParams)

export const planListQuery = z.object({
  ...pageParams,
  active: z.enum(['true', 'false']).optional(),
})

export const metricsQuery = z.object({
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
})

export const createCustomerBody = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
})

export const createPlanBody = z.object({
  name: z.string().trim().min(1),
  amountCents: z.number().int().positive(),
  interval: z.enum(['monthly', 'yearly']),
})

export const createSubscriptionBody = z.discriminatedUnion('paymentMethod', [
  z.object({
    customerId: z.string().min(1),
    planId: z.string().min(1),
    paymentMethod: z.literal('card'),
    cardToken: z.string().min(1),
  }),
  z.object({
    customerId: z.string().min(1),
    planId: z.string().min(1),
    paymentMethod: z.enum(['pix', 'boleto']),
  }),
])

export const setCardBody = z.object({
  cardToken: z.enum([
    'tok_success',
    'tok_insufficient_funds',
    'tok_expired_card',
    'tok_fail_then_success',
  ]),
})
