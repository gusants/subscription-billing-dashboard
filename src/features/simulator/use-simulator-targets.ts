import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { formatCurrency } from '../../lib/format-currency'
import { formatDate } from '../../lib/format-date'
import { customerChargesQuery } from '../customer-detail/charges-queries'
import {
  customerDetailQuery,
  subscriptionQuery,
} from '../customer-detail/customer-detail-queries'
import { allPlansQuery } from '../plans/plans-queries'

export function useSimulatorTargets() {
  const { customerId } = useParams({ strict: false })
  const hasCustomer = Boolean(customerId)
  const charges = useInfiniteQuery({
    ...customerChargesQuery(customerId ?? ''),
    enabled: hasCustomer,
  })
  const customer = useQuery({
    ...customerDetailQuery(customerId ?? ''),
    enabled: hasCustomer,
  })
  const plans = useQuery(allPlansQuery())
  const firstSubscriptionId = customer.data?.subscriptions.find(
    (s) => s.status !== 'canceled',
  )?.id
  const firstSubscription = useQuery({
    ...subscriptionQuery(firstSubscriptionId ?? ''),
    enabled: Boolean(firstSubscriptionId),
  })

  const loaded = charges.data?.pages.flatMap((page) => page.data) ?? []
  const pendingOf = (method: 'pix' | 'boleto') =>
    loaded
      .filter(
        (charge) => charge.status === 'pending' && charge.method === method,
      )
      .map((charge) => ({
        id: charge.id,
        label: `${formatCurrency(charge.amountCents)} due ${formatDate(charge.dueDate)}`,
      }))

  const cardSubscriptions =
    firstSubscription.data?.paymentMethod === 'card'
      ? [
          {
            id: firstSubscription.data.id,
            label:
              plans.data?.get(firstSubscription.data.planId)?.name ??
              'Card subscription',
          },
        ]
      : []

  return {
    customerId,
    customerName: customer.data?.name,
    pendingPix: pendingOf('pix'),
    pendingBoleto: pendingOf('boleto'),
    cardSubscriptions,
  }
}
