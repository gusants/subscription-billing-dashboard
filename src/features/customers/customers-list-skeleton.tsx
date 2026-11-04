import { Skeleton } from '../../components/feedback/skeleton'

const PLACEHOLDER_ROWS = 8

export function CustomersListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading customers"
      className="border-border bg-surface flex flex-col rounded-lg border"
    >
      {Array.from({ length: PLACEHOLDER_ROWS }, (_, index) => (
        <div
          key={index}
          className="border-border flex items-center gap-6 border-b px-4 py-3.5 last:border-b-0"
        >
          <Skeleton className="h-4 w-48" />
          <Skeleton className="hidden h-4 w-64 md:block" />
          <Skeleton className="ml-auto h-4 w-24" />
        </div>
      ))}
    </div>
  )
}
