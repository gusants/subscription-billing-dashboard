import { RotateCw } from 'lucide-react'
import { Button } from '../../components/ui/button'
import type { ChargeView } from './use-optimistic-retry'

export function RetryButton({
  charge,
  onRetry,
}: {
  charge: ChargeView
  onRetry: (chargeId: string) => void
}) {
  return (
    <Button
      isPending={charge.isRetrying}
      onPress={() => onRetry(charge.id)}
      aria-label={`Retry charge due ${charge.dueDate.slice(0, 10)}`}
      className="h-8 px-2.5"
    >
      <RotateCw
        aria-hidden
        size={14}
        strokeWidth={1.75}
        className={charge.isRetrying ? 'motion-safe:animate-spin' : ''}
      />
      {charge.isRetrying ? 'Retrying…' : 'Retry now'}
    </Button>
  )
}
