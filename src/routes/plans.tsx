import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/plans')({
  component: PlansPage,
})

function PlansPage() {
  return <h1>Plans</h1>
}
