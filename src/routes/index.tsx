import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: OverviewPage,
})

function OverviewPage() {
  return <h1>Overview</h1>
}
