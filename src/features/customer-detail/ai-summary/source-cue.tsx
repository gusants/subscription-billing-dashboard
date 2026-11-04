import { Bot, ListChecks } from 'lucide-react'
import type { CustomerSummary } from '../../../api/contract'

const SOURCES = {
  llm: {
    icon: Bot,
    label: 'AI-written',
    explanation:
      'Text written by the AI model from anonymized payment history.',
  },
  fallback: {
    icon: ListChecks,
    label: 'Rule-based fallback',
    explanation:
      'The AI model was unavailable, so fixed rules wrote this summary.',
  },
} as const

export function SourceCue({ source }: { source: CustomerSummary['source'] }) {
  const { icon: Icon, label, explanation } = SOURCES[source]

  return (
    <div className="flex items-start gap-2 text-xs">
      <Icon
        aria-hidden
        size={14}
        strokeWidth={1.75}
        className="text-fg-muted mt-px shrink-0"
      />
      <p>
        <span className="font-medium">{label}.</span>{' '}
        <span className="text-fg-muted">{explanation}</span>
      </p>
    </div>
  )
}
