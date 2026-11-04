import { EmptyState } from '../../components/feedback/empty-state'
import { QueryError } from '../../components/feedback/query-error'
import { Skeleton } from '../../components/feedback/skeleton'
import { Button } from '../../components/ui/button'
import { ChargeItem } from './charge-item'
import { ChargesTable } from './charges-table'
import type { useChargesTimeline } from './use-charges-timeline'

const PLACEHOLDER_CHARGES = 4

type ChargesTimelineProps = {
  timeline: ReturnType<typeof useChargesTimeline>
}

export function ChargesTimeline({
  timeline: { query, charges, retryCharge },
}: ChargesTimelineProps) {
  if (query.isPending) {
    return (
      <div
        role="status"
        aria-label="Loading charges"
        className="flex flex-col gap-2"
      >
        {Array.from({ length: PLACEHOLDER_CHARGES }, (_, index) => (
          <Skeleton key={index} className="h-16" />
        ))}
      </div>
    )
  }

  if (query.isError) {
    return (
      <QueryError
        title="Charges could not load"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const total = query.data.pages[0]?.meta.total ?? 0

  if (charges.length === 0) {
    return (
      <EmptyState
        title="No charges yet"
        description="Charges appear here when a subscription is billed."
      />
    )
  }

  return (
    <div className="@container flex flex-col gap-3">
      <div className="border-border bg-surface hidden overflow-x-auto rounded-lg border @3xl:block">
        <ChargesTable charges={charges} onRetry={retryCharge} />
      </div>
      <ol
        aria-label="Charges list"
        className="divide-border border-border bg-surface divide-y rounded-lg border @3xl:hidden"
      >
        {charges.map((charge) => (
          <ChargeItem key={charge.id} charge={charge} onRetry={retryCharge} />
        ))}
      </ol>
      <div className="text-fg-muted flex items-center justify-between gap-4">
        <span className="tabular-nums">
          Showing {charges.length} of {total} charges
        </span>
        {query.hasNextPage && (
          <Button
            isPending={query.isFetchingNextPage}
            onPress={() => void query.fetchNextPage()}
          >
            {query.isFetchingNextPage ? 'Loading…' : 'Load older charges'}
          </Button>
        )}
      </div>
    </div>
  )
}
