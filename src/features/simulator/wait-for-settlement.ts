import { customersApi } from '../../api/endpoints'

const SETTLEMENT_LOOKUP_LIMIT = 100

type PollingOptions = { intervalMs: number; maxPolls: number }

const WEBHOOK_SETTLEMENT_POLLING: PollingOptions = {
  intervalMs: 250,
  maxPolls: 20,
}

const pause = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

async function isStillPending(customerId: string, chargeId: string) {
  const { data } = await customersApi.charges(customerId, {
    limit: SETTLEMENT_LOOKUP_LIMIT,
  })
  return data.find((charge) => charge.id === chargeId)?.status === 'pending'
}

export async function waitForSettlement(
  customerId: string,
  chargeId: string,
  { intervalMs, maxPolls }: PollingOptions = WEBHOOK_SETTLEMENT_POLLING,
) {
  for (let poll = 0; poll < maxPolls; poll += 1) {
    if (!(await isStillPending(customerId, chargeId))) return true
    await pause(intervalMs)
  }
  return false
}
