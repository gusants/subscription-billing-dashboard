import { Sparkles } from 'lucide-react'

export function AiSummaryPlaceholder() {
  return (
    <section
      aria-labelledby="ai-summary-heading"
      className="border-border bg-surface flex flex-col gap-2 rounded-lg border p-4"
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
      <p className="text-fg-muted">
        A risk level and suggested next step for this customer will appear here.
      </p>
    </section>
  )
}
