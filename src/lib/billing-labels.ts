import type {
  ChargeStatus,
  PaymentMethod,
  SubscriptionStatus,
} from '../api/contract'

export type StatusTone = 'success' | 'danger' | 'warning' | 'neutral'

type StatusLabel = { label: string; tone: StatusTone }

const SUBSCRIPTION_STATUS: Record<SubscriptionStatus, StatusLabel> = {
  active: { label: 'Active', tone: 'success' },
  past_due: { label: 'Past due', tone: 'danger' },
  incomplete: { label: 'Incomplete', tone: 'warning' },
  canceled: { label: 'Canceled', tone: 'neutral' },
}

const CHARGE_STATUS: Record<ChargeStatus, StatusLabel> = {
  paid: { label: 'Paid', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  failed: { label: 'Failed', tone: 'danger' },
  expired: { label: 'Expired', tone: 'neutral' },
  uncollectible: { label: 'Uncollectible', tone: 'danger' },
}

const PAYMENT_METHOD: Record<PaymentMethod, string> = {
  card: 'Card',
  pix: 'Pix',
  boleto: 'Boleto',
}

const DECLINE_REASONS: Record<string, string> = {
  insufficient_funds: 'Insufficient funds',
  expired_card: 'Expired card',
  invalid_token: 'Invalid card',
}

export const subscriptionStatuses = Object.keys(
  SUBSCRIPTION_STATUS,
) as SubscriptionStatus[]

export function subscriptionStatusLabel(status: SubscriptionStatus) {
  return SUBSCRIPTION_STATUS[status]
}

export function chargeStatusLabel(status: ChargeStatus) {
  return CHARGE_STATUS[status]
}

export function paymentMethodLabel(method: PaymentMethod) {
  return PAYMENT_METHOD[method]
}

export function declineReasonLabel(reason: string) {
  return DECLINE_REASONS[reason] ?? 'Declined by the card issuer'
}
