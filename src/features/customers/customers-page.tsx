import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { CUSTOMERS_PAGE_SIZE, toCustomerListParams } from './customers-search'
import { customersListQuery } from './customers-queries'
import { CustomersTable } from './customers-table'
import { CustomersToolbar } from './customers-toolbar'
import { Pagination } from '../../components/ui/pagination'

const route = getRouteApi('/customers/')

export function CustomersPage() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data, isPlaceholderData } = useQuery(
    customersListQuery(toCustomerListParams(search)),
  )

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
        <p className="text-fg-muted">
          Find a customer to see their subscription and payment history.
        </p>
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

      {data && (
        <section
          aria-busy={isPlaceholderData}
          className={`flex flex-col gap-4 transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}
        >
          <div className="border-border bg-surface overflow-x-auto rounded-lg border">
            <CustomersTable customers={data.data} />
          </div>
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            total={data.meta.total}
            pageSize={CUSTOMERS_PAGE_SIZE}
            itemLabel="customers"
            onPageChange={(page) =>
              void navigate({ search: (prev) => ({ ...prev, page }) })
            }
          />
        </section>
      )}
    </div>
  )
}
