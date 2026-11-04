import type { CardToken, PaymentMethod } from '../../src/api/contract.ts'
import type { PlanKey } from './catalog.ts'
import { SUMMARIES } from './catalog.ts'

export type Ending =
  | 'ongoing'
  | 'pastDue'
  | 'churned'
  | 'pendingCurrent'
  | 'incomplete'
  | 'boletoExpired'
  | 'canceled'
  | 'upgraded'

export type Profile = {
  method: PaymentMethod
  cardToken: CardToken | null
  ending: Ending
  plans: readonly PlanKey[]
  tenureMonths: readonly [number, number]
  firstAttemptDeclineRate: number
  summary: keyof typeof SUMMARIES
  count: number
}

export const PROFILES: readonly Profile[] = [
  {
    method: 'card',
    cardToken: 'tok_success',
    ending: 'ongoing',
    plans: ['solo', 'studio', 'studio-annual'],
    tenureMonths: [4, 12],
    firstAttemptDeclineRate: 0,
    summary: 'reliable',
    count: 8,
  },
  {
    method: 'card',
    cardToken: 'tok_fail_then_success',
    ending: 'ongoing',
    plans: ['solo', 'studio'],
    tenureMonths: [5, 12],
    firstAttemptDeclineRate: 0.35,
    summary: 'recovers',
    count: 5,
  },
  {
    method: 'card',
    cardToken: 'tok_insufficient_funds',
    ending: 'pastDue',
    plans: ['solo', 'studio'],
    tenureMonths: [3, 12],
    firstAttemptDeclineRate: 0.1,
    summary: 'pastDue',
    count: 4,
  },
  {
    method: 'card',
    cardToken: 'tok_expired_card',
    ending: 'churned',
    plans: ['solo', 'studio'],
    tenureMonths: [3, 8],
    firstAttemptDeclineRate: 0,
    summary: 'churned',
    count: 3,
  },
  {
    method: 'card',
    cardToken: 'tok_success',
    ending: 'upgraded',
    plans: ['solo'],
    tenureMonths: [6, 12],
    firstAttemptDeclineRate: 0,
    summary: 'reliable',
    count: 3,
  },
  {
    method: 'pix',
    cardToken: null,
    ending: 'ongoing',
    plans: ['solo', 'studio', 'studio-annual'],
    tenureMonths: [2, 12],
    firstAttemptDeclineRate: 0,
    summary: 'reliable',
    count: 7,
  },
  {
    method: 'pix',
    cardToken: null,
    ending: 'pendingCurrent',
    plans: ['solo', 'studio'],
    tenureMonths: [2, 10],
    firstAttemptDeclineRate: 0,
    summary: 'reliable',
    count: 2,
  },
  {
    method: 'pix',
    cardToken: null,
    ending: 'incomplete',
    plans: ['studio'],
    tenureMonths: [0, 0],
    firstAttemptDeclineRate: 0,
    summary: 'newAccount',
    count: 1,
  },
  {
    method: 'boleto',
    cardToken: null,
    ending: 'ongoing',
    plans: ['solo', 'studio'],
    tenureMonths: [3, 12],
    firstAttemptDeclineRate: 0,
    summary: 'boletoLate',
    count: 4,
  },
  {
    method: 'boleto',
    cardToken: null,
    ending: 'boletoExpired',
    plans: ['studio'],
    tenureMonths: [4, 11],
    firstAttemptDeclineRate: 0,
    summary: 'boletoOverdue',
    count: 2,
  },
  {
    method: 'card',
    cardToken: 'tok_success',
    ending: 'canceled',
    plans: ['solo'],
    tenureMonths: [3, 9],
    firstAttemptDeclineRate: 0,
    summary: 'canceled',
    count: 1,
  },
]
