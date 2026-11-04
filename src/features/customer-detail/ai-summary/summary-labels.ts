import type { PaymentBehavior, RiskLevel } from '../../../api/contract'
import type { StatusTone } from '../../../lib/billing-labels'

const RISK: Record<RiskLevel, { label: string; tone: StatusTone }> = {
  low: { label: 'Low risk', tone: 'success' },
  medium: { label: 'Medium risk', tone: 'warning' },
  high: { label: 'High risk', tone: 'danger' },
}

const BEHAVIOR: Record<PaymentBehavior, string> = {
  on_time: 'Pays on time',
  occasional_delays: 'Occasional delays',
  frequent_delays: 'Frequent delays',
}

export function riskLabel(level: RiskLevel) {
  return RISK[level]
}

export function behaviorLabel(behavior: PaymentBehavior) {
  return BEHAVIOR[behavior]
}
