import { createFileRoute, notFound } from '@tanstack/react-router'
import { ApiError } from '../../api/client'
import { CustomerDetailPage } from '../../features/customer-detail/customer-detail-page'
import { customerDetailQuery } from '../../features/customer-detail/customer-detail-queries'
import { CustomerNotFound } from '../../features/customer-detail/customer-not-found'

const HTTP_NOT_FOUND = 404

export const Route = createFileRoute('/customers/$customerId')({
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData(
        customerDetailQuery(params.customerId),
      )
    } catch (error) {
      if (error instanceof ApiError && error.status === HTTP_NOT_FOUND)
        throw notFound()
      throw error
    }
  },
  component: CustomerDetailPage,
  notFoundComponent: CustomerNotFound,
})
