import type {
  Customer,
  PaymentAttempt,
  PaymentMethod,
  Plan,
  SubscriptionStatus,
} from '../../src/api/contract.ts'
import {
  BOLETO_DUE_IN_DAYS,
  BOLETO_EXPIRES_AFTER_DUE_DAYS,
  PIX_EXPIRES_IN_DAYS,
  RETRY_SCHEDULE_DAYS,
} from '../../src/mocks/billing-rules.ts'
import type {
  DemoCharge,
  DemoDatabase,
  DemoSubscription,
} from '../../src/mocks/demo-types.ts'
import {
  PLAN_CATALOG,
  SCHOOL_NAMES,
  SCHOOL_PREFIXES,
  SUMMARIES,
  TEACHER_FIRST_NAMES,
  TEACHER_LAST_NAMES,
  type PlanKey,
} from './catalog.ts'
import { addDays, addHours, addMonths, atHour } from './dates.ts'
import { PROFILES, type Profile } from './profiles.ts'
import { createRandom, type Random } from './random.ts'

const BILLING_HOUR_UTC = 9
const PLANS_CREATED_AT = '2025-09-01T12:00:00.000Z'

type Period = { start: Date; end: Date }

type Builder = {
  random: Random
  now: Date
  plans: Map<PlanKey, Plan>
  charges: DemoCharge[]
}

function iso(date: Date) {
  return date.toISOString()
}

function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function createPlans(random: Random) {
  return new Map(
    PLAN_CATALOG.map((entry) => [
      entry.key,
      {
        id: random.id('pln'),
        name: entry.name,
        amountCents: entry.amountCents,
        interval: entry.interval,
        active: true,
        createdAt: PLANS_CREATED_AT,
        updatedAt: PLANS_CREATED_AT,
      } satisfies Plan,
    ]),
  )
}

function createCustomerIdentity(
  random: Random,
  planKey: PlanKey,
  usedNames: Set<string>,
) {
  for (;;) {
    const isTeacher = planKey === 'solo'
    const distinctivePart = isTeacher
      ? `${random.pick(TEACHER_FIRST_NAMES)} ${random.pick(TEACHER_LAST_NAMES)}`
      : random.pick(SCHOOL_NAMES)
    if (usedNames.has(distinctivePart)) continue
    usedNames.add(distinctivePart)
    const name = isTeacher
      ? `${distinctivePart} Aulas de Música`
      : `${random.pick(SCHOOL_PREFIXES)} ${distinctivePart}`
    return { name, email: `financeiro@${slugify(name)}.example` }
  }
}

function monthsPerPeriod(plan: Plan) {
  return plan.interval === 'yearly' ? 12 : 1
}

function periodsBetween(anchor: Date, plan: Plan, until: Date) {
  const step = monthsPerPeriod(plan)
  const periods: Period[] = []
  for (let index = 0; ; index += 1) {
    const start = addMonths(anchor, index * step)
    if (start > until) return periods
    periods.push({ start, end: addMonths(anchor, (index + 1) * step) })
  }
}

function attempt(
  random: Random,
  at: Date,
  result: PaymentAttempt['result'],
  failureReason: PaymentAttempt['failureReason'] = null,
): PaymentAttempt {
  return { id: random.id('att'), createdAt: iso(at), result, failureReason }
}

function newCharge(
  builder: Builder,
  subscription: DemoSubscription,
  plan: Plan,
  period: Period,
  method: PaymentMethod,
): DemoCharge {
  const dueDate =
    method === 'boleto'
      ? addDays(period.start, BOLETO_DUE_IN_DAYS)
      : period.start
  return {
    id: builder.random.id('chg'),
    subscriptionId: subscription.id,
    amountCents: plan.amountCents,
    method,
    status: 'pending',
    attemptCount: 0,
    attempts: [],
    createdAt: iso(period.start),
    dueDate: iso(dueDate),
    periodStart: iso(period.start),
    periodEnd: iso(period.end),
    paidAt: null,
    nextRetryAt: null,
    expiresAt: null,
  }
}

function settleCardCharge(
  builder: Builder,
  charge: DemoCharge,
  profile: Profile,
) {
  const start = new Date(charge.periodStart)
  const declinedFirst = builder.random.chance(profile.firstAttemptDeclineRate)
  const attempts = declinedFirst
    ? [
        attempt(builder.random, start, 'declined', 'insufficient_funds'),
        attempt(
          builder.random,
          addDays(start, RETRY_SCHEDULE_DAYS[0]),
          'succeeded',
        ),
      ]
    : [attempt(builder.random, start, 'succeeded')]
  const last = attempts.at(-1)
  return {
    ...charge,
    status: 'paid' as const,
    attempts,
    attemptCount: attempts.length,
    paidAt: last?.createdAt ?? null,
  }
}

function settleInstantCharge(builder: Builder, charge: DemoCharge) {
  const due = new Date(charge.dueDate)
  if (charge.method === 'pix') {
    return {
      ...charge,
      status: 'paid' as const,
      expiresAt: iso(addDays(due, PIX_EXPIRES_IN_DAYS)),
      paidAt: iso(addHours(due, builder.random.int(1, 20))),
    }
  }
  const expiresAt = addDays(due, BOLETO_EXPIRES_AFTER_DUE_DAYS)
  const paidAt = addHours(due, builder.random.int(-40, 44))
  return {
    ...charge,
    status: 'paid' as const,
    expiresAt: iso(expiresAt),
    paidAt: iso(paidAt),
  }
}

function settleRegularCharge(
  builder: Builder,
  charge: DemoCharge,
  profile: Profile,
) {
  const settled =
    charge.method === 'card'
      ? settleCardCharge(builder, charge, profile)
      : settleInstantCharge(builder, charge)
  const settledInTheFuture =
    settled.paidAt !== null && new Date(settled.paidAt) > builder.now
  return settledInTheFuture ? pendingInstantCharge(charge) : settled
}

function pastDueCharge(builder: Builder, charge: DemoCharge) {
  const start = new Date(charge.periodStart)
  const retryTimes = RETRY_SCHEDULE_DAYS.map((days) => addDays(start, days))
  const attemptTimes = [
    start,
    ...retryTimes.filter((time) => time <= builder.now),
  ]
  const attempts = attemptTimes.map((time) =>
    attempt(builder.random, time, 'declined', 'insufficient_funds'),
  )
  const nextRetry = retryTimes.find((time) => time > builder.now)
  return {
    ...charge,
    status: 'failed' as const,
    attempts,
    attemptCount: attempts.length,
    nextRetryAt: nextRetry ? iso(nextRetry) : null,
  }
}

function uncollectibleCharge(builder: Builder, charge: DemoCharge) {
  const start = new Date(charge.periodStart)
  const times = [
    start,
    ...RETRY_SCHEDULE_DAYS.map((days) => addDays(start, days)),
  ]
  const attempts = times.map((time) =>
    attempt(builder.random, time, 'declined', 'expired_card'),
  )
  return {
    ...charge,
    status: 'uncollectible' as const,
    attempts,
    attemptCount: attempts.length,
  }
}

function pendingInstantCharge(charge: DemoCharge) {
  const due = new Date(charge.dueDate)
  const expiresInDays =
    charge.method === 'pix'
      ? PIX_EXPIRES_IN_DAYS
      : BOLETO_EXPIRES_AFTER_DUE_DAYS
  return { ...charge, expiresAt: iso(addDays(due, expiresInDays)) }
}

function expiredBoletoCharge(charge: DemoCharge) {
  const expiresAt = addDays(
    new Date(charge.dueDate),
    BOLETO_EXPIRES_AFTER_DUE_DAYS,
  )
  return {
    ...charge,
    status: 'expired' as const,
    expiresAt: iso(expiresAt),
    nextRetryAt: iso(addDays(expiresAt, RETRY_SCHEDULE_DAYS[0])),
  }
}

function lastPeriodStart(builder: Builder, profile: Profile) {
  const today = atHour(builder.now, BILLING_HOUR_UTC)
  switch (profile.ending) {
    case 'pastDue':
      return addDays(today, -builder.random.int(0, 4))
    case 'pendingCurrent':
    case 'incomplete':
      return today
    case 'boletoExpired':
      return addDays(
        today,
        -(BOLETO_DUE_IN_DAYS + BOLETO_EXPIRES_AFTER_DUE_DAYS),
      )
    default:
      return addDays(today, -builder.random.int(0, 27))
  }
}

type SubscriptionPlan = {
  customer: Customer
  plan: Plan
  profile: Profile
  anchor: Date
  stopAfter: Date
}

function buildSubscription(
  builder: Builder,
  { customer, plan, profile, anchor, stopAfter }: SubscriptionPlan,
) {
  const periods = periodsBetween(anchor, plan, stopAfter)
  const subscription: DemoSubscription = {
    id: builder.random.id('sub'),
    customerId: customer.id,
    planId: plan.id,
    paymentMethod: profile.method,
    status: 'active',
    billingAnchor: iso(anchor),
    currentPeriodStart: iso(anchor),
    currentPeriodEnd: iso(anchor),
    canceledAt: null,
    cardToken: profile.cardToken,
    createdAt: iso(anchor),
    updatedAt: iso(anchor),
  }

  const charges = periods.map((period, index) => {
    const charge = newCharge(
      builder,
      subscription,
      plan,
      period,
      profile.method,
    )
    const isLast = index === periods.length - 1
    if (!isLast) return settleRegularCharge(builder, charge, profile)
    return closingCharge(builder, charge, profile)
  })

  const lastPeriod = periods.at(-1)
  const lastCharge = charges.at(-1)
  if (!lastPeriod || !lastCharge)
    throw new Error(`No billing period for ${customer.name}`)

  const status = closingStatus(profile.ending)
  const canceledAt =
    status === 'canceled'
      ? iso(
          profile.ending === 'churned'
            ? new Date(
                lastCharge.attempts.at(-1)?.createdAt ?? lastCharge.dueDate,
              )
            : lastPeriod.end,
        )
      : null

  builder.charges.push(...charges)
  return {
    ...subscription,
    status,
    canceledAt,
    currentPeriodStart: iso(lastPeriod.start),
    currentPeriodEnd: iso(lastPeriod.end),
    updatedAt: canceledAt ?? lastCharge.paidAt ?? lastCharge.createdAt,
  }
}

function closingCharge(builder: Builder, charge: DemoCharge, profile: Profile) {
  switch (profile.ending) {
    case 'pastDue':
      return pastDueCharge(builder, charge)
    case 'churned':
      return uncollectibleCharge(builder, charge)
    case 'pendingCurrent':
    case 'incomplete':
      return pendingInstantCharge(charge)
    case 'boletoExpired':
      return expiredBoletoCharge(charge)
    default:
      return settleRegularCharge(builder, charge, profile)
  }
}

function closingStatus(ending: Profile['ending']): SubscriptionStatus {
  switch (ending) {
    case 'pastDue':
    case 'boletoExpired':
      return 'past_due'
    case 'churned':
    case 'canceled':
    case 'upgraded':
      return 'canceled'
    case 'incomplete':
      return 'incomplete'
    default:
      return 'active'
  }
}

function tenureFor(builder: Builder, profile: Profile, plan: Plan) {
  const months = builder.random.int(...profile.tenureMonths)
  return plan.interval === 'yearly'
    ? Math.min(12, Math.floor(months / 12) * 12)
    : months
}

function buildCustomerAccount(
  builder: Builder,
  profile: Profile,
  usedNames: Set<string>,
) {
  const planKey = builder.random.pick(profile.plans)
  const plan = builder.plans.get(planKey)
  if (!plan) throw new Error(`Unknown plan ${planKey}`)

  const target = lastPeriodStart(builder, profile)
  const anchor = addMonths(target, -tenureFor(builder, profile, plan))
  const identity = createCustomerIdentity(builder.random, planKey, usedNames)
  const createdAt = iso(addHours(anchor, -builder.random.int(2, 72)))
  const customer: Customer = {
    id: builder.random.id('cus'),
    ...identity,
    createdAt,
    updatedAt: createdAt,
  }

  if (profile.ending === 'upgraded') {
    const studio = builder.plans.get('studio')
    if (!studio) throw new Error('Studio plan missing')
    const upgradeAt = addMonths(anchor, builder.random.int(2, 4))
    const soloSubscription = buildSubscription(builder, {
      customer,
      plan,
      profile,
      anchor,
      stopAfter: addDays(upgradeAt, -1),
    })
    const studioSubscription = buildSubscription(builder, {
      customer,
      plan: studio,
      profile: { ...profile, ending: 'ongoing' },
      anchor: upgradeAt,
      stopAfter: builder.now,
    })
    return { customer, subscriptions: [soloSubscription, studioSubscription] }
  }

  const stopAfter =
    profile.ending === 'churned' || profile.ending === 'canceled'
      ? addMonths(target, -builder.random.int(1, 2))
      : builder.now
  const subscription = buildSubscription(builder, {
    customer,
    plan,
    profile,
    anchor,
    stopAfter,
  })
  return { customer, subscriptions: [subscription] }
}

export function buildDatabase(seed: number, now: Date): DemoDatabase {
  const random = createRandom(seed)
  const builder: Builder = {
    random,
    now,
    plans: createPlans(random),
    charges: [],
  }
  const usedNames = new Set<string>()
  const customers: Customer[] = []
  const subscriptions: DemoSubscription[] = []
  const summaries: DemoDatabase['summaries'] = {}

  for (const profile of PROFILES) {
    for (let index = 0; index < profile.count; index += 1) {
      const account = buildCustomerAccount(builder, profile, usedNames)
      customers.push(account.customer)
      subscriptions.push(...account.subscriptions)
      summaries[account.customer.id] = SUMMARIES[profile.summary]
    }
  }

  const byCreatedAt = <T extends { createdAt: string }>(a: T, b: T) =>
    a.createdAt.localeCompare(b.createdAt)
  return {
    synthetic: true,
    now: iso(now),
    plans: [...builder.plans.values()],
    customers: customers.sort(byCreatedAt),
    subscriptions: subscriptions.sort(byCreatedAt),
    charges: builder.charges.sort(byCreatedAt),
    summaries,
  }
}
