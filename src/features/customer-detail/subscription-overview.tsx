import { useQuery } from '@tanstack/react-query'
import type { CustomerDetail, Plan } from '../../api/contract'
import { Skeleton } from '../../components/feedback/skeleton'
import { StatusBadge } from '../../components/ui/status-badge'
import {
  paymentMethodLabel,
  subscriptionStatusLabel,
} from '../../lib/billing-labels'
import { formatDate } from '../../lib/format-date'
import { formatPlanPrice } from '../../lib/format-plan-price'
import { subscriptionQuery } from './customer-detail-queries'
import { StatCard } from './stat-card'

type SubscriptionOverviewProps = {
  subscription: CustomerDetail['subscriptions'][number]
  plan: Plan | undefined
}

export function SubscriptionOverview({
  subscription,
  plan,
}: SubscriptionOverviewProps) {
  const details = useQuery(subscriptionQuery(subscription.id))
  const isCanceled = subscription.status === 'canceled'

  return (
    <section aria-label="Subscription overview">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Status">
          <StatusBadge {...subscriptionStatusLabel(subscription.status)} />
        </StatCard>
        <StatCard label="Plan">
          {plan ? (
            `${plan.name} · ${formatPlanPrice(plan)}`
          ) : (
            <Skeleton className="h-5 w-32" />
          )}
        </StatCard>
        <StatCard label="Payment method">
          {details.data ? (
            paymentMethodLabel(details.data.paymentMethod)
          ) : (
            <Skeleton className="h-5 w-16" />
          )}
        </StatCard>
        <StatCard label={isCanceled ? 'Canceled on' : 'Current period ends'}>
          {isCanceled && details.data?.canceledAt
            ? formatDate(details.data.canceledAt)
            : formatDate(subscription.currentPeriodEnd)}
        </StatCard>
      </dl>
    </section>
  )
}
