import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import type { CustomerDetail, Plan } from '../../api/contract'
import { Skeleton } from '../../components/feedback/skeleton'
import { StatusBadge } from '../../components/ui/status-badge'
import { subscriptionStatusLabel } from '../../lib/billing-labels'
import { formatCurrency } from '../../lib/format-currency'
import { formatDate } from '../../lib/format-date'
import { formatPlanPrice } from '../../lib/format-plan-price'
import { nextRetryDate } from '../../lib/retry-schedule'
import { customerChargesQuery } from './charges-queries'
import { customerSummaryQuery } from './customer-detail-queries'
import { StatCard } from './stat-card'

type SubscriptionOverviewProps = {
  customerId: string
  subscription: CustomerDetail['subscriptions'][number]
  plan: Plan | undefined
}

function useNextRetry(customerId: string, subscriptionId: string) {
  const charges = useInfiniteQuery(customerChargesQuery(customerId))
  const latest = charges.data?.pages[0]?.data.find(
    (charge) => charge.subscriptionId === subscriptionId,
  )
  return {
    isPending: charges.isPending,
    retryAt: latest ? nextRetryDate(latest) : null,
  }
}

export function SubscriptionOverview({
  customerId,
  subscription,
  plan,
}: SubscriptionOverviewProps) {
  const summary = useQuery(customerSummaryQuery(customerId))
  const nextRetry = useNextRetry(customerId, subscription.id)

  return (
    <section aria-label="Subscription overview">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Status">
          <StatusBadge {...subscriptionStatusLabel(subscription.status)} />
        </StatCard>
        <StatCard label={plan ? `Amount · ${plan.name}` : 'Amount'}>
          {plan ? formatPlanPrice(plan) : <Skeleton className="h-5 w-28" />}
        </StatCard>
        <StatCard label="Next retry">
          {nextRetry.isPending ? (
            <Skeleton className="h-5 w-24" />
          ) : nextRetry.retryAt ? (
            formatDate(nextRetry.retryAt)
          ) : (
            <span className="text-fg-subtle font-normal">None scheduled</span>
          )}
        </StatCard>
        <StatCard label="Lifetime paid">
          {summary.data ? (
            formatCurrency(summary.data.metrics.totalPaidCents)
          ) : summary.isError ? (
            <span className="text-fg-subtle font-normal">Unavailable</span>
          ) : (
            <Skeleton className="h-5 w-24" />
          )}
        </StatCard>
      </dl>
    </section>
  )
}
