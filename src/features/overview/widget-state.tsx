import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { QueryError } from '../../components/feedback/query-error'
import { Skeleton } from '../../components/feedback/skeleton'

type WidgetStateProps<T> = {
  query: UseQueryResult<T>
  title: string
  skeletonClassName: string
  children: (data: T) => ReactNode
}

export function WidgetState<T>({
  query,
  title,
  skeletonClassName,
  children,
}: WidgetStateProps<T>) {
  if (query.isPending) {
    return (
      <div role="status" aria-label={`Loading ${title.toLowerCase()}`}>
        <Skeleton className={skeletonClassName} />
      </div>
    )
  }
  if (query.isError) {
    return (
      <QueryError
        title={`${title} could not load`}
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    )
  }
  return children(query.data)
}
