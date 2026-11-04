import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from 'react-aria-components'
import type { Customer } from '../../api/contract'
import { formatDate } from '../../lib/format-date'

const columnClass = 'px-4 py-2.5 text-left text-xs font-medium text-fg-muted'

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const navigate = useNavigate()

  return (
    <Table
      aria-label="Customers"
      onRowAction={(key) =>
        void navigate({
          to: '/customers/$customerId',
          params: { customerId: String(key) },
        })
      }
      className="w-full border-separate border-spacing-0"
    >
      <TableHeader className="bg-surface-muted/60">
        <Column isRowHeader className={`${columnClass} rounded-tl-lg`}>
          Customer
        </Column>
        <Column className={columnClass}>Email</Column>
        <Column className={columnClass}>Customer since</Column>
        <Column className={`${columnClass} w-10 rounded-tr-lg`}>
          <span className="sr-only">Open</span>
        </Column>
      </TableHeader>
      <TableBody items={customers}>
        {(customer) => (
          <Row
            id={customer.id}
            className="group hover:bg-surface-muted/50 data-focus-visible:bg-accent-soft cursor-default outline-none"
          >
            <Cell className="border-border border-t px-4 py-3 font-medium">
              <Link
                to="/customers/$customerId"
                params={{ customerId: customer.id }}
                className="hover:text-accent hover:underline"
              >
                {customer.name}
              </Link>
            </Cell>
            <Cell className="border-border text-fg-muted border-t px-4 py-3">
              {customer.email}
            </Cell>
            <Cell className="border-border text-fg-muted border-t px-4 py-3 tabular-nums">
              {formatDate(customer.createdAt)}
            </Cell>
            <Cell className="border-border text-fg-subtle border-t px-4 py-3">
              <ChevronRight
                aria-hidden
                size={16}
                strokeWidth={1.75}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  )
}
