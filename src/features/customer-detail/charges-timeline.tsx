import { useInfiniteQuery } from '@tanstack/react-query'
import { EmptyState } from '../../components/feedback/empty-state'
import { QueryError } from '../../components/feedback/query-error'
import { Skeleton } from '../../components/feedback/skeleton'
import { Button } from '../../components/ui/button'
import { ChargeItem } from './charge-item'
import { customerChargesQuery } from './charges-queries'

const PLACEHOLDER_CHARGES = 4

export function ChargesTimeline({ customerId }: { customerId: string }) {
  const query = useInfiniteQuery(customerChargesQuery(customerId))

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

  const charges = query.data.pages.flatMap((page) => page.data)
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
    <div className="flex flex-col gap-3">
      <ol
        aria-label="Charges"
        className="divide-border border-border bg-surface divide-y rounded-lg border"
      >
        {charges.map((charge) => (
          <ChargeItem key={charge.id} charge={charge} />
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
