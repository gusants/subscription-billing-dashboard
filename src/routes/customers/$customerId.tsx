import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/customers/$customerId')({
  component: CustomerDetailPage,
})

function CustomerDetailPage() {
  const { customerId } = Route.useParams()
  return (
    <h1 className="text-xl font-semibold tracking-tight">
      Customer {customerId}
    </h1>
  )
}
