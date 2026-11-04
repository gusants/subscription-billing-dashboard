import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { Skeleton } from '../../../components/feedback/skeleton'
import { Button } from '../../../components/ui/button'
import { StatusBadge } from '../../../components/ui/status-badge'
import { customerChargesQuery } from '../charges-queries'
import { customerSummaryQuery } from '../customer-detail-queries'
import { behaviorLabel, riskLabel } from './summary-labels'

function useChargeCount(customerId: string) {
  const charges = useInfiniteQuery(customerChargesQuery(customerId))
  return charges.data?.pages[0]?.meta.total
}

export function AiSummaryCard({ customerId }: { customerId: string }) {
  const summary = useQuery(customerSummaryQuery(customerId))
  const chargeCount = useChargeCount(customerId)
  const generate = () => void summary.refetch()
  const isWorking = summary.isFetching

  return (
    <section
      aria-labelledby="ai-summary-heading"
      aria-busy={isWorking}
      className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-4"
    >
      <h2
        id="ai-summary-heading"
        className="flex items-center gap-2 font-semibold"
      >
        <Sparkles
          aria-hidden
          size={16}
          strokeWidth={1.75}
          className="text-accent"
        />
        AI summary
      </h2>

      {isWorking ? (
        <div className="flex flex-col gap-2">
          <p className="text-fg-muted">
            Analyzing {chargeCount === undefined ? 'the' : chargeCount} charges…
          </p>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : summary.data ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge {...riskLabel(summary.data.riskLevel)} />
            <span className="text-fg-muted">
              {behaviorLabel(summary.data.paymentBehavior)}
            </span>
          </div>
          <p>{summary.data.summary}</p>
          <div className="border-border flex flex-col gap-1 border-t pt-3">
            <h3 className="text-fg-muted text-xs font-medium">
              Suggested action
            </h3>
            <p className="font-medium">{summary.data.suggestedAction}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="text-fg-muted">
            Get a plain-language read of this customer's payment history: a risk
            level and a suggested next step.
          </p>
          <Button variant="primary" onPress={generate}>
            Generate summary
          </Button>
        </div>
      )}
    </section>
  )
}
