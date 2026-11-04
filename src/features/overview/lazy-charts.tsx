import { lazy } from 'react'

export const RevenueChart = lazy(() =>
  import('./revenue-chart').then((module) => ({
    default: module.RevenueChart,
  })),
)

export const SubscriptionsByStatusChart = lazy(() =>
  import('./subscriptions-by-status-chart').then((module) => ({
    default: module.SubscriptionsByStatusChart,
  })),
)
