import { useQuery } from '@tanstack/react-query'
import { plansApi } from '../../api/endpoints'
import { queryKeys } from '../../api/query-keys'
import { EmptyState } from '../../components/feedback/empty-state'
import { QueryError } from '../../components/feedback/query-error'
import { Skeleton } from '../../components/feedback/skeleton'
import { StatusBadge } from '../../components/ui/status-badge'
import { formatDate } from '../../lib/format-date'
import { formatPlanPrice } from '../../lib/format-plan-price'
import { PlanForm } from './plan-form'

const PLANS_LIST = { limit: 100 } as const
const headerClass = 'px-4 py-2.5 text-left text-xs font-medium text-fg-muted'
const cellClass = 'border-t border-border px-4 py-3'

function PlansTable() {
  const query = useQuery({
    queryKey: queryKeys.plans.list(PLANS_LIST),
    queryFn: () => plansApi.list(PLANS_LIST),
  })

  if (query.isPending) {
    return (
      <div role="status" aria-label="Loading plans">
        <Skeleton className="h-48" />
      </div>
    )
  }
  if (query.isError) {
    return (
      <QueryError
        title="Plans could not load"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    )
  }
  if (query.data.data.length === 0) {
    return (
      <EmptyState
        title="No plans yet"
        description="Create the first plan to start selling subscriptions."
      />
    )
  }

  return (
    <div className="border-border bg-surface overflow-x-auto rounded-lg border">
      <table
        aria-label="Plans"
        className="w-full border-separate border-spacing-0"
      >
        <thead className="bg-surface-muted/60">
          <tr>
            <th scope="col" className={`${headerClass} rounded-tl-lg`}>
              Plan
            </th>
            <th scope="col" className={headerClass}>
              Price
            </th>
            <th scope="col" className={headerClass}>
              Status
            </th>
            <th scope="col" className={`${headerClass} rounded-tr-lg`}>
              Created
            </th>
          </tr>
        </thead>
        <tbody>
          {query.data.data.map((plan) => (
            <tr key={plan.id}>
              <td className={`${cellClass} font-medium`}>{plan.name}</td>
              <td className={`${cellClass} whitespace-nowrap tabular-nums`}>
                {formatPlanPrice(plan)}
              </td>
              <td className={cellClass}>
                <StatusBadge
                  label={plan.active ? 'Active' : 'Archived'}
                  tone={plan.active ? 'success' : 'neutral'}
                />
              </td>
              <td
                className={`${cellClass} text-fg-muted whitespace-nowrap tabular-nums`}
              >
                {formatDate(plan.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PlansPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Plans</h1>
        <p className="text-fg-muted">
          What customers can subscribe to, and at what price.
        </p>
      </header>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <PlansTable />
        <PlanForm />
      </div>
    </div>
  )
}
