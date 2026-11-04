import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import type { CustomerList } from '../../api/contract'
import { EmptyState } from '../../components/feedback/empty-state'
import { QueryError } from '../../components/feedback/query-error'
import { Button } from '../../components/ui/button'
import { Pagination } from '../../components/ui/pagination'
import { CustomersListSkeleton } from './customers-list-skeleton'
import { customersListQuery } from './customers-queries'
import { CUSTOMERS_PAGE_SIZE, toCustomerListParams } from './customers-search'
import { CustomersStackedList } from './customers-stacked-list'
import { CustomersTable } from './customers-table'
import { CustomersToolbar } from './customers-toolbar'
import { NewCustomerDialog } from './new-customer-dialog'

const route = getRouteApi('/customers/')

export function CustomersPage() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const query = useQuery(customersListQuery(toCustomerListParams(search)))
  const hasFilters = Boolean(search.q || search.status)

  const clearFilters = () => void navigate({ search: {} })
  const goToPage = (page: number) =>
    void navigate({ search: (prev) => ({ ...prev, page }) })

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
          <p className="text-fg-muted">
            Find a customer to see their subscription and payment history.
          </p>
        </div>
        <NewCustomerDialog />
      </header>

      <CustomersToolbar
        search={search.q}
        status={search.status}
        onSearchChange={(q) =>
          void navigate({ search: (prev) => ({ ...prev, q, page: 1 }) })
        }
        onStatusChange={(status) =>
          void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
        }
      />

      {query.isPending && <CustomersListSkeleton />}
      {query.isError && (
        <QueryError
          title="Customers could not load"
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      )}
      {query.data && query.data.meta.total === 0 && (
        <EmptyState
          title={
            hasFilters ? 'No customers match these filters' : 'No customers yet'
          }
          description={
            hasFilters
              ? 'Try another name or email, or clear the filters to see every customer.'
              : 'Customers appear here as soon as they are created through the API.'
          }
          action={
            hasFilters && <Button onPress={clearFilters}>Clear filters</Button>
          }
        />
      )}
      {query.data && query.data.meta.total > 0 && (
        <CustomersResults
          list={query.data}
          isStale={query.isPlaceholderData}
          onPageChange={goToPage}
        />
      )}
    </div>
  )
}

type CustomersResultsProps = {
  list: CustomerList
  isStale: boolean
  onPageChange: (page: number) => void
}

function CustomersResults({
  list,
  isStale,
  onPageChange,
}: CustomersResultsProps) {
  return (
    <section
      aria-label="Customer results"
      aria-busy={isStale}
      className={`flex flex-col gap-4 transition-opacity ${isStale ? 'opacity-60' : ''}`}
    >
      <div className="border-border bg-surface hidden overflow-x-auto rounded-lg border md:block">
        <CustomersTable customers={list.data} />
      </div>
      <div className="md:hidden">
        <CustomersStackedList customers={list.data} />
      </div>
      <Pagination
        page={list.meta.page}
        totalPages={list.meta.totalPages}
        total={list.meta.total}
        pageSize={CUSTOMERS_PAGE_SIZE}
        itemLabel="customers"
        onPageChange={onPageChange}
      />
    </section>
  )
}
