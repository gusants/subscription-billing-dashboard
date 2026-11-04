import type { SubscriptionStatus } from '../../api/contract'
import { SearchField } from '../../components/ui/search-field'
import { Select, type SelectOption } from '../../components/ui/select'
import {
  subscriptionStatusLabel,
  subscriptionStatuses,
} from '../../lib/billing-labels'
import { useDebouncedCallback } from '../../lib/use-debounced-callback'
import { useState } from 'react'

const SEARCH_DEBOUNCE_MS = 300
const ALL_STATUSES = 'all'

type StatusFilter = SubscriptionStatus | typeof ALL_STATUSES

const statusOptions: SelectOption<StatusFilter>[] = [
  { id: ALL_STATUSES, label: 'All statuses' },
  ...subscriptionStatuses.map((status) => ({
    id: status,
    label: subscriptionStatusLabel(status).label,
  })),
]

type CustomersToolbarProps = {
  search: string | undefined
  status: SubscriptionStatus | undefined
  onSearchChange: (search: string | undefined) => void
  onStatusChange: (status: SubscriptionStatus | undefined) => void
}

export function CustomersToolbar({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: CustomersToolbarProps) {
  const [draft, setDraft] = useState(search ?? '')
  const commitSearch = useDebouncedCallback(
    (value: string) => onSearchChange(value.trim() || undefined),
    SEARCH_DEBOUNCE_MS,
  )

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="sm:w-80">
        <SearchField
          label="Search customers"
          placeholder="Search by name or email"
          value={draft}
          onChange={(value) => {
            setDraft(value)
            commitSearch(value)
          }}
        />
      </div>
      <Select
        label="Subscription status"
        options={statusOptions}
        value={status ?? ALL_STATUSES}
        onChange={(value) =>
          onStatusChange(value === ALL_STATUSES ? undefined : value)
        }
      />
    </div>
  )
}
