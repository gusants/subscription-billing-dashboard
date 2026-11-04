import { RotateCw } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { formatDate } from '../../lib/format-date'
import type { ChargeView } from './use-optimistic-retry'

type RetryButtonProps = {
  charge: ChargeView
  onRetry: (chargeId: string) => void
  prominence?: 'inline' | 'primary'
}

export function RetryButton({
  charge,
  onRetry,
  prominence = 'inline',
}: RetryButtonProps) {
  const isPrimary = prominence === 'primary'
  const idleLabel = isPrimary ? 'Retry charge' : 'Retry now'

  return (
    <Button
      variant={isPrimary ? 'primary' : 'secondary'}
      isPending={charge.isRetrying}
      onPress={() => onRetry(charge.id)}
      aria-label={`Retry charge due ${formatDate(charge.dueDate)}`}
      className={isPrimary ? '' : 'h-8 px-2.5'}
    >
      <RotateCw
        aria-hidden
        size={14}
        strokeWidth={1.75}
        className={charge.isRetrying ? 'motion-safe:animate-spin' : ''}
      />
      {charge.isRetrying ? 'Retrying…' : idleLabel}
    </Button>
  )
}
