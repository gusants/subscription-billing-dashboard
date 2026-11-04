import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/customers/')({
  component: CustomersPage,
})

function CustomersPage() {
  return <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
}
