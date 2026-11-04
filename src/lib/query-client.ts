import { MutationCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/client'
import { notify } from '../components/toast/toast-queue'

const THIRTY_SECONDS_MS = 30_000
const MAX_QUERY_RETRIES = 1
const FIRST_SERVER_ERROR_STATUS = 500

function isClientError(error: Error) {
  return error instanceof ApiError && error.status < FIRST_SERVER_ERROR_STATUS
}

export function shouldRetryQuery(failureCount: number, error: Error) {
  return !isClientError(error) && failureCount < MAX_QUERY_RETRIES
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: THIRTY_SECONDS_MS, retry: shouldRetryQuery },
    },
    mutationCache: new MutationCache({
      onError: (error) => notify.error('Action failed', error.message),
    }),
  })
}
