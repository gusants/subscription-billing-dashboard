import type { CustomerDetail, Plan } from '../../api/contract'
import { StatusBadge } from '../../components/ui/status-badge'
import { subscriptionStatusLabel } from '../../lib/billing-labels'
import { formatDate } from '../../lib/format-date'
import { formatPlanPrice } from '../../lib/format-plan-price'

type SubscriptionsPanelProps = {
  subscriptions: CustomerDetail['subscriptions']
  plans: Map<string, Plan> | undefined
  primaryId: string | undefined
}

export function SubscriptionsPanel({
  subscriptions,
  plans,
  primaryId,
}: SubscriptionsPanelProps) {
  return (
    <section
      aria-labelledby="subscriptions-heading"
      className="border-border bg-surface rounded-lg border"
    >
      <h2
        id="subscriptions-heading"
        className="border-border border-b px-4 py-3 font-semibold"
      >
        Subscriptions
      </h2>
      <ul className="divide-border divide-y">
        {subscriptions.map((subscription) => {
          const plan = plans?.get(subscription.planId)
          return (
            <li
              key={subscription.id}
              className="flex items-start justify-between gap-3 px-4 py-3"
            >
              <div className="flex min-w-0 flex-col">
                <span className="font-medium">
                  {plan?.name ?? 'Plan'}
                  {subscription.id === primaryId && (
                    <span className="sr-only"> (shown above)</span>
                  )}
                </span>
                {plan && (
                  <span className="text-fg-muted tabular-nums">
                    {formatPlanPrice(plan)}
                  </span>
                )}
                <span className="text-fg-muted whitespace-nowrap tabular-nums">
                  {subscription.status === 'canceled' ? 'Ended' : 'Renews'}{' '}
                  {formatDate(subscription.currentPeriodEnd)}
                </span>
              </div>
              <StatusBadge {...subscriptionStatusLabel(subscription.status)} />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
