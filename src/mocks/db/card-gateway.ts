import type { CardToken, PaymentAttempt } from '../../api/contract'

type CardOutcome = Pick<PaymentAttempt, 'result' | 'failureReason'>

const approved: CardOutcome = { result: 'succeeded', failureReason: null }
const declined = (
  failureReason: NonNullable<PaymentAttempt['failureReason']>,
): CardOutcome => ({
  result: 'declined',
  failureReason,
})

export function decideCardOutcome(
  token: CardToken | null,
  attemptNumber: number,
): CardOutcome {
  switch (token) {
    case 'tok_success':
      return approved
    case 'tok_insufficient_funds':
      return declined('insufficient_funds')
    case 'tok_expired_card':
      return declined('expired_card')
    case 'tok_fail_then_success':
      return attemptNumber === 1 ? declined('insufficient_funds') : approved
    default:
      return declined('invalid_token')
  }
}

const KNOWN_TOKENS: readonly CardToken[] = [
  'tok_success',
  'tok_insufficient_funds',
  'tok_expired_card',
  'tok_fail_then_success',
]

export function toCardToken(value: string): CardToken | null {
  return KNOWN_TOKENS.find((token) => token === value) ?? null
}
