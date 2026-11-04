import { LoaderCircle } from 'lucide-react'

export function PendingAttemptLabel({
  attemptNumber,
}: {
  attemptNumber: number
}) {
  return (
    <span className="text-fg-muted inline-flex items-center gap-1.5">
      <LoaderCircle
        aria-hidden
        size={14}
        strokeWidth={2}
        className="text-accent motion-safe:animate-spin"
      />
      Attempt {attemptNumber}: charging the card…
    </span>
  )
}
