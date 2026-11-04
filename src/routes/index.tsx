import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: OverviewPage,
})

function OverviewPage() {
  return <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
}
