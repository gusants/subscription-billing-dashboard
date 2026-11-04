import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { CustomersPage } from '../../features/customers/customers-page'
import { customersListQuery } from '../../features/customers/customers-queries'
import {
  customersSearchSchema,
  toCustomerListParams,
} from '../../features/customers/customers-search'

export const Route = createFileRoute('/customers/')({
  validateSearch: customersSearchSchema,
  search: { middlewares: [stripSearchParams({ page: 1 })] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    void context.queryClient.prefetchQuery(
      customersListQuery(toCustomerListParams(deps)),
    )
  },
  component: CustomersPage,
})
