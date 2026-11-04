import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import type { Customer } from '../../api/contract'
import { formatDate } from '../../lib/format-date'

export function CustomersStackedList({ customers }: { customers: Customer[] }) {
  return (
    <ul
      aria-label="Customers"
      className="divide-border border-border bg-surface divide-y rounded-lg border"
    >
      {customers.map((customer) => (
        <li key={customer.id}>
          <Link
            to="/customers/$customerId"
            params={{ customerId: customer.id }}
            className="hover:bg-surface-muted/50 flex items-center gap-3 px-4 py-3"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">{customer.name}</span>
              <span className="text-fg-muted truncate">{customer.email}</span>
              <span className="text-fg-subtle text-xs tabular-nums">
                Since {formatDate(customer.createdAt)}
              </span>
            </div>
            <ChevronRight
              aria-hidden
              size={16}
              strokeWidth={1.75}
              className="text-fg-subtle shrink-0"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
