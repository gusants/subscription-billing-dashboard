import type { Charge } from '../../api/contract'

export function chargeSignature(charge: Charge) {
  return `${charge.status}:${charge.attempts.length}`
}
