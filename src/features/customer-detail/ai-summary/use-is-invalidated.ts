import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

export function useIsInvalidated(queryKey: QueryKey) {
  const queryClient = useQueryClient()
  return useSyncExternalStore(
    (onChange) => queryClient.getQueryCache().subscribe(onChange),
    () => queryClient.getQueryState(queryKey)?.isInvalidated ?? false,
  )
}
