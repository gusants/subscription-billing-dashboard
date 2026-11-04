import { useInfiniteQuery } from '@tanstack/react-query'
import { customerChargesQuery } from './charges-queries'
import { useOptimisticRetry } from './use-optimistic-retry'

const NO_CHARGES: never[] = []

export function useChargesTimeline(customerId: string) {
  const query = useInfiniteQuery(customerChargesQuery(customerId))
  const loadedCharges =
    query.data?.pages.flatMap((page) => page.data) ?? NO_CHARGES
  return { query, ...useOptimisticRetry(customerId, loadedCharges) }
}
