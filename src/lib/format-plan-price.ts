import type { Plan } from '../api/contract'
import { formatCurrency } from './format-currency'

const INTERVAL_SUFFIX: Record<Plan['interval'], string> = {
  monthly: '/mo',
  yearly: '/yr',
}

export function formatPlanPrice(plan: Pick<Plan, 'amountCents' | 'interval'>) {
  return `${formatCurrency(plan.amountCents)}${INTERVAL_SUFFIX[plan.interval]}`
}
