import { showServerFieldErrors } from '../../components/form/server-field-errors'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import type { CreateSubscriptionInput } from '../../api/contract'
import { subscriptionsApi } from '../../api/endpoints'
import { invalidateAfter } from '../../api/query-keys'
import { useAppForm } from '../../components/form/app-form'
import { notify } from '../../components/toast/toast-queue'
import { Button } from '../../components/ui/button'
import { Modal } from '../../components/ui/modal'
import { subscriptionStatusLabel } from '../../lib/billing-labels'
import { formatPlanPrice } from '../../lib/format-plan-price'
import { useIdempotencyKey } from '../../lib/use-idempotency-key'
import { allPlansQuery } from '../plans/plans-queries'

const methodOptions = [
  {
    id: 'card',
    label: 'Card',
    description: 'Charged now, retried if declined',
  },
  { id: 'pix', label: 'Pix', description: 'Pending until the customer pays' },
  { id: 'boleto', label: 'Boleto', description: 'Due in 3 days' },
]

const testCardOptions = [
  { id: 'tok_success', label: 'Approves' },
  { id: 'tok_insufficient_funds', label: 'Declines: insufficient funds' },
  { id: 'tok_expired_card', label: 'Declines: expired card' },
  { id: 'tok_fail_then_success', label: 'Declines once, then approves' },
]

const subscriptionFormSchema = z
  .object({
    planId: z.string().min(1, 'Pick the plan to subscribe to'),
    paymentMethod: z.enum(['card', 'pix', 'boleto'], 'Choose a payment method'),
    cardToken: z.string(),
  })
  .refine(
    (value) => value.paymentMethod !== 'card' || value.cardToken.length > 0,
    {
      message: 'Pick a test card',
      path: ['cardToken'],
    },
  )

type SubscriptionFormValues = {
  planId: string
  paymentMethod: string
  cardToken: string
}

function toInput(
  customerId: string,
  value: SubscriptionFormValues,
): CreateSubscriptionInput {
  const parsed = subscriptionFormSchema.parse(value)
  return parsed.paymentMethod === 'card'
    ? {
        customerId,
        planId: parsed.planId,
        paymentMethod: 'card',
        cardToken: parsed.cardToken,
      }
    : { customerId, planId: parsed.planId, paymentMethod: parsed.paymentMethod }
}

export function NewSubscriptionDialog({ customerId }: { customerId: string }) {
  const [isOpen, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const plans = useQuery(allPlansQuery())
  const idempotency = useIdempotencyKey()
  const planOptions = [...(plans.data?.values() ?? [])]
    .filter((plan) => plan.active)
    .map((plan) => ({
      id: plan.id,
      label: `${plan.name} · ${formatPlanPrice(plan)}`,
    }))

  const createSubscription = useMutation({
    mutationFn: (input: CreateSubscriptionInput) =>
      subscriptionsApi.create(input, idempotency.keyFor(input)),
    meta: { showsFieldErrors: true },
    onSuccess: async (subscription) => {
      idempotency.rotate()
      await invalidateAfter(queryClient, {
        type: 'subscription-created',
        customerId,
        subscriptionId: subscription.id,
      })
      const { label } = subscriptionStatusLabel(subscription.status)
      if (subscription.status === 'past_due') {
        notify.error(
          'Subscription created, first charge declined',
          `Status: ${label}`,
        )
      } else {
        notify.success('Subscription created', `Status: ${label}`)
      }
    },
  })

  const form = useAppForm({
    defaultValues: {
      planId: '',
      paymentMethod: 'card',
      cardToken: 'tok_success',
    } as SubscriptionFormValues,
    validators: {
      onBlur: subscriptionFormSchema,
      onSubmit: subscriptionFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await createSubscription
        .mutateAsync(toInput(customerId, value))
        .catch((error: unknown) => {
          showServerFieldErrors(formApi, error)
          throw error
        })
      formApi.reset()
      setOpen(false)
    },
  })

  const close = () => {
    form.reset()
    idempotency.rotate()
    setOpen(false)
  }

  return (
    <>
      <Button onPress={() => setOpen(true)}>
        <Plus aria-hidden size={15} strokeWidth={1.75} />
        New subscription
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={(open) => (open ? setOpen(true) : close())}
        title="New subscription"
      >
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit().catch(() => undefined)
          }}
          className="flex flex-col gap-4"
        >
          <form.AppField name="planId">
            {(field) => (
              <field.SelectField
                label="Plan"
                placeholder="Choose a plan"
                options={planOptions}
              />
            )}
          </form.AppField>
          <form.AppField name="paymentMethod">
            {(field) => (
              <field.RadioCardsField
                label="Payment method"
                options={methodOptions}
              />
            )}
          </form.AppField>
          <form.Subscribe selector={(state) => state.values.paymentMethod}>
            {(paymentMethod) =>
              paymentMethod === 'card' && (
                <form.AppField name="cardToken">
                  {(field) => (
                    <field.SelectField
                      label="Test card"
                      placeholder="Choose a test card"
                      options={testCardOptions}
                    />
                  )}
                </form.AppField>
              )
            }
          </form.Subscribe>
          <div className="flex justify-end gap-2">
            <Button onPress={close}>Cancel</Button>
            <form.AppForm>
              <form.SubmitButton
                label="Create subscription"
                pendingLabel="Creating…"
              />
            </form.AppForm>
          </div>
        </form>
      </Modal>
    </>
  )
}
