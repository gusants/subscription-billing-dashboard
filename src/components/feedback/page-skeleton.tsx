import { Skeleton } from './skeleton'

export function PageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex flex-col gap-6"
    >
      <Skeleton className="h-7 w-56" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  )
}
