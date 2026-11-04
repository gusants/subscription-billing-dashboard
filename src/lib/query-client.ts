import { MutationCache, QueryClient } from '@tanstack/react-query'
import { notify } from '../components/toast/toast-queue'

const THIRTY_SECONDS_MS = 30_000

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: THIRTY_SECONDS_MS, retry: 1 },
    },
    mutationCache: new MutationCache({
      onError: (error) => notify.error('Action failed', error.message),
    }),
  })
}
