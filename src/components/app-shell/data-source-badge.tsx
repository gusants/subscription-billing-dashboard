import { isDemoMode } from '../../lib/env'
import { StatusBadge } from '../ui/status-badge'

export function DataSourceBadge() {
  return isDemoMode ? (
    <StatusBadge label="Demo data" tone="neutral" />
  ) : (
    <StatusBadge label="Live API" tone="success" />
  )
}
