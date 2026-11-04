import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { Link, getRouteApi } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { formatDate } from '../../lib/format-date'
import { allPlansQuery } from '../plans/plans-queries'
import { AiSummaryPlaceholder } from './ai-summary-placeholder'
import { ChargesTimeline } from './charges-timeline'
import {
  customerDetailQuery,
  primarySubscription,
} from './customer-detail-queries'
import { SubscriptionOverview } from './subscription-overview'
import { SubscriptionsPanel } from './subscriptions-panel'

const route = getRouteApi('/customers/$customerId')

export function CustomerDetailPage() {
  const { customerId } = route.useParams()
  const { data: customer } = useSuspenseQuery(customerDetailQuery(customerId))
  const { data: plans } = useQuery(allPlansQuery())
  const primary = primarySubscription(customer.subscriptions)

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Breadcrumb">
        <ol className="text-fg-muted flex items-center gap-1.5">
          <li>
            <Link to="/customers" className="hover:text-fg hover:underline">
              Customers
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight size={14} strokeWidth={1.75} />
          </li>
          <li aria-current="page" className="text-fg truncate">
            {customer.name}
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          {customer.name}
        </h1>
        <p className="text-fg-muted">
          {customer.email} · Customer since {formatDate(customer.createdAt)}
        </p>
      </header>

      {primary ? (
        <SubscriptionOverview
          subscription={primary}
          plan={plans?.get(primary.planId)}
        />
      ) : (
        <p className="border-border-strong text-fg-muted rounded-lg border border-dashed px-4 py-6">
          This customer has no subscriptions yet.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section
          aria-labelledby="charges-heading"
          className="flex flex-col gap-3"
        >
          <h2 id="charges-heading" className="font-semibold">
            Charges
          </h2>
          <ChargesTimeline customerId={customer.id} />
        </section>
        <aside className="flex flex-col gap-6">
          <AiSummaryPlaceholder />
          {customer.subscriptions.length > 0 && (
            <SubscriptionsPanel
              subscriptions={customer.subscriptions}
              plans={plans}
              primaryId={primary?.id}
            />
          )}
        </aside>
      </div>
    </div>
  )
}
