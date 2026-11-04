import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { OverviewPage } from '../features/overview/overview-page'
import {
  DEFAULT_OVERVIEW_PERIOD,
  overviewSearchSchema,
} from '../features/overview/overview-search'

export const Route = createFileRoute('/')({
  validateSearch: overviewSearchSchema,
  search: {
    middlewares: [stripSearchParams({ period: DEFAULT_OVERVIEW_PERIOD })],
  },
  component: OverviewPage,
})
