import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { CircleAlert, RotateCw } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from 'react-aria-components'

const FALLBACK_ERROR_MESSAGE = 'Something went wrong while loading the data.'

function describeError(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : FALLBACK_ERROR_MESSAGE
}

export function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  function retry() {
    reset()
    void router.invalidate()
  }

  return (
    <section
      role="alert"
      className="flex max-w-lg flex-col items-start gap-3 py-16"
    >
      <CircleAlert
        aria-hidden
        size={22}
        strokeWidth={1.75}
        className="text-danger"
      />
      <h1 className="text-xl font-semibold tracking-tight">
        This page could not load
      </h1>
      <div className="text-fg-muted">
        <p>{describeError(error)}</p>
        <p>Check your connection and try again.</p>
      </div>
      <Button
        onPress={retry}
        className="bg-accent text-accent-fg hover:bg-accent-hover mt-1 inline-flex cursor-default items-center gap-2 rounded-md px-3.5 py-2 font-medium transition-colors"
      >
        <RotateCw aria-hidden size={15} strokeWidth={1.75} />
        Try again
      </Button>
    </section>
  )
}
