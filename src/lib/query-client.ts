import { MutationCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/client'
import { describeError, isFieldValidationError } from '../api/error-messages'
import { notify } from '../components/toast/toast-queue'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: { showsFieldErrors?: boolean }
  }
}

const THIRTY_SECONDS_MS = 30_000
const MAX_QUERY_RETRIES = 1
const FIRST_CLIENT_ERROR_STATUS = 400
const FIRST_SERVER_ERROR_STATUS = 500

function isClientError(error: Error) {
  return (
    error instanceof ApiError &&
    error.status >= FIRST_CLIENT_ERROR_STATUS &&
    error.status < FIRST_SERVER_ERROR_STATUS
  )
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
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.showsFieldErrors && isFieldValidationError(error))
          return
        const { title, detail } = describeError(error)
        notify.error(title, detail)
      },
    }),
  })
}
