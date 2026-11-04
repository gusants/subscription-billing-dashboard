import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { CircleAlert, RotateCw, Sparkles } from 'lucide-react'
import type { CustomerSummary } from '../../../api/contract'
import { Skeleton } from '../../../components/feedback/skeleton'
import { Button } from '../../../components/ui/button'
import { StatusBadge } from '../../../components/ui/status-badge'
import { formatRelative } from '../../../lib/format-date'
import { customerChargesQuery } from '../charges-queries'
import { customerSummaryQuery } from '../customer-detail-queries'
import { SourceCue } from './source-cue'
import { behaviorLabel, riskLabel } from './summary-labels'
import { SummaryMetrics } from './summary-metrics'
import { useIsInvalidated } from './use-is-invalidated'

function useChargeCount(customerId: string) {
  const charges = useInfiniteQuery(customerChargesQuery(customerId))
  return charges.data?.pages[0]?.meta.total
}

function Loading({ chargeCount }: { chargeCount: number | undefined }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-fg-muted">
        Analyzing {chargeCount === undefined ? 'the' : chargeCount} charges…
      </p>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

function Intro({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-fg-muted">
        Get a plain-language read of this customer's payment history: a risk
        level and a suggested next step. The numbers come from the charges; the
        AI only writes the text.
      </p>
      <Button variant="primary" onPress={onGenerate}>
        Generate summary
      </Button>
    </div>
  )
}

function Failure({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-2">
      <p className="flex items-start gap-2">
        <CircleAlert
          aria-hidden
          size={16}
          strokeWidth={1.75}
          className="text-danger mt-0.5 shrink-0"
        />
        <span>
          <span className="font-medium">
            The summary could not be generated.
          </span>{' '}
          <span className="text-fg-muted">{error.message}</span>
        </span>
      </p>
      <Button onPress={onRetry}>
        <RotateCw aria-hidden size={14} strokeWidth={1.75} />
        Try again
      </Button>
    </div>
  )
}

type ReadyProps = {
  summary: CustomerSummary
  generatedAt: number
  isOutdated: boolean
  onRegenerate: () => void
}

function Ready({ summary, generatedAt, isOutdated, onRegenerate }: ReadyProps) {
  return (
    <div className="flex flex-col gap-3">
      {isOutdated && (
        <div className="border-warning/40 bg-warning-soft/50 flex flex-col items-start gap-2 rounded-md border p-3">
          <p className="text-xs">
            <span className="font-medium">Outdated.</span> New payment activity
            happened after this summary.
          </p>
          <Button onPress={onRegenerate} className="h-8 px-2.5">
            <RotateCw aria-hidden size={14} strokeWidth={1.75} />
            Regenerate
          </Button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge {...riskLabel(summary.riskLevel)} />
        <span className="text-fg-muted">
          {behaviorLabel(summary.paymentBehavior)}
        </span>
      </div>
      <p>{summary.summary}</p>
      <SummaryMetrics metrics={summary.metrics} />
      <div className="border-border flex flex-col gap-1 border-t pt-3">
        <h3 className="text-fg-muted text-xs font-medium">
          Suggested action (for a human)
        </h3>
        <p className="font-medium">{summary.suggestedAction}</p>
        <p className="text-fg-subtle text-xs">
          Nothing happens automatically. You decide whether to act.
        </p>
      </div>
      <SourceCue source={summary.source} />
      <p className="text-fg-subtle text-xs">
        Prompt {summary.promptVersion} · Generated{' '}
        {formatRelative(new Date(generatedAt).toISOString())}
      </p>
    </div>
  )
}

export function AiSummaryCard({ customerId }: { customerId: string }) {
  const summaryQuery = customerSummaryQuery(customerId)
  const summary = useQuery(summaryQuery)
  const isOutdated = useIsInvalidated(summaryQuery.queryKey)
  const chargeCount = useChargeCount(customerId)
  const generate = () => void summary.refetch()
  const announcement =
    summary.data && !summary.isFetching
      ? `Summary ready: ${riskLabel(summary.data.riskLevel).label}`
      : ''

  return (
    <section
      aria-labelledby="ai-summary-heading"
      aria-busy={summary.isFetching}
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
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      {summary.isFetching ? (
        <Loading chargeCount={chargeCount} />
      ) : summary.isError ? (
        <Failure error={summary.error} onRetry={generate} />
      ) : summary.data ? (
        <Ready
          summary={summary.data}
          generatedAt={summary.dataUpdatedAt}
          isOutdated={isOutdated}
          onRegenerate={generate}
        />
      ) : (
        <Intro onGenerate={generate} />
      )}
    </section>
  )
}
