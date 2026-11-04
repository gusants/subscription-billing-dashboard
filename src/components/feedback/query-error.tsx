import { describeError } from '../../api/error-messages'
import { CircleAlert, RotateCw } from 'lucide-react'
import { Button } from '../ui/button'

type QueryErrorProps = {
  title: string
  error: Error
  onRetry: () => void
}

export function QueryError({ title, error, onRetry }: QueryErrorProps) {
  return (
    <div
      role="alert"
      className="border-danger/30 bg-danger-soft/40 flex flex-col items-start gap-3 rounded-lg border p-5"
    >
      <div className="flex items-start gap-2.5">
        <CircleAlert
          aria-hidden
          size={18}
          strokeWidth={1.75}
          className="text-danger mt-px shrink-0"
        />
        <div className="flex flex-col gap-0.5">
          <h2 className="font-semibold">{title}</h2>
          <p className="text-fg-muted">{describeError(error).detail}</p>
        </div>
      </div>
      <Button onPress={onRetry}>
        <RotateCw aria-hidden size={15} strokeWidth={1.75} />
        Try again
      </Button>
    </div>
  )
}
