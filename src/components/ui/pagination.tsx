import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from 'react-aria-components'

type PaginationProps = {
  page: number
  totalPages: number
  total: number
  pageSize: number
  itemLabel: string
  onPageChange: (page: number) => void
}

const pageButtonClass =
  'inline-flex h-8 cursor-default items-center gap-1 rounded-md border border-border bg-surface px-2.5 font-medium transition-colors hover:border-border-strong data-disabled:opacity-50 data-disabled:hover:border-border'

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  itemLabel,
  onPageChange,
}: PaginationProps) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Pagination"
      className="text-fg-muted flex items-center justify-between gap-4"
    >
      <p className="tabular-nums">
        {first}–{last} of {total} {itemLabel}
      </p>
      <div className="flex gap-2">
        <Button
          isDisabled={page <= 1}
          onPress={() => onPageChange(page - 1)}
          className={pageButtonClass}
        >
          <ChevronLeft aria-hidden size={15} strokeWidth={1.75} />
          Previous
        </Button>
        <Button
          isDisabled={page >= totalPages}
          onPress={() => onPageChange(page + 1)}
          className={pageButtonClass}
        >
          Next
          <ChevronRight aria-hidden size={15} strokeWidth={1.75} />
        </Button>
      </div>
    </nav>
  )
}
