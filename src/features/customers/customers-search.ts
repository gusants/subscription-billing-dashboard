import { z } from 'zod'
import { subscriptionStatuses } from '../../lib/billing-labels'

export const CUSTOMERS_PAGE_SIZE = 20

export const customersSearchSchema = z.object({
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(subscriptionStatuses).optional().catch(undefined),
  page: z.coerce.number().int().min(1).default(1).catch(1),
})

export type CustomersSearch = z.infer<typeof customersSearchSchema>

export function toCustomerListParams({ q, status, page }: CustomersSearch) {
  return {
    search: q,
    subscriptionStatus: status,
    page,
    limit: CUSTOMERS_PAGE_SIZE,
  }
}
