import { showServerFieldErrors } from '../../components/form/server-field-errors'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { plansApi } from '../../api/endpoints'
import { invalidateAfter } from '../../api/query-keys'
import { useAppForm } from '../../components/form/app-form'
import { notify } from '../../components/toast/toast-queue'
import { formatPlanPrice } from '../../lib/format-plan-price'
import { isMoneyInput, parseMoneyToCents } from '../../lib/parse-money'

const MAX_NAME_LENGTH = 60

const planFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Give the plan a name')
    .max(MAX_NAME_LENGTH, 'Keep the name under 60 characters'),
  price: z
    .string()
    .refine(isMoneyInput, 'Enter a price like 389.90')
    .refine(
      (value) => !isMoneyInput(value) || parseMoneyToCents(value) > 0,
      'Price must be above zero',
    ),
  interval: z.enum(['monthly', 'yearly'], 'Choose how often it bills'),
})

type PlanFormValues = { name: string; price: string; interval: string }

const emptyPlan: PlanFormValues = { name: '', price: '', interval: 'monthly' }

const intervalOptions = [
  { id: 'monthly', label: 'Monthly', description: 'Billed every month' },
  { id: 'yearly', label: 'Yearly', description: 'Billed once a year' },
]

export function PlanForm() {
  const queryClient = useQueryClient()
  const createPlan = useMutation({
    mutationFn: plansApi.create,
    meta: { showsFieldErrors: true },
    onSuccess: async (plan) => {
      await invalidateAfter(queryClient, { type: 'plan-created' })
      notify.success(
        'Plan created',
        `${plan.name} · ${formatPlanPrice(plan)} is available for new subscriptions.`,
      )
    },
  })

  const form = useAppForm({
    defaultValues: emptyPlan,
    validators: { onBlur: planFormSchema, onSubmit: planFormSchema },
    onSubmit: async ({ value, formApi }) => {
      const parsed = planFormSchema.parse(value)
      await createPlan
        .mutateAsync({
          name: parsed.name,
          amountCents: parseMoneyToCents(parsed.price),
          interval: parsed.interval,
        })
        .catch((error: unknown) => {
          showServerFieldErrors(formApi, error, { amountCents: 'price' })
          throw error
        })
      formApi.reset()
    },
  })

  return (
    <section
      aria-labelledby="new-plan-heading"
      className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-4"
    >
      <h2 id="new-plan-heading" className="font-semibold">
        New plan
      </h2>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit().catch(() => undefined)
        }}
        className="flex flex-col gap-4"
      >
        <form.AppField name="name">
          {(field) => <field.TextField label="Name" placeholder="Ensemble" />}
        </form.AppField>
        <form.AppField name="price">
          {(field) => (
            <field.TextField
              label="Price (R$)"
              inputMode="decimal"
              placeholder="389.90"
              description="Charged each billing period"
            />
          )}
        </form.AppField>
        <form.AppField name="interval">
          {(field) => (
            <field.RadioCardsField
              label="Billing interval"
              options={intervalOptions}
            />
          )}
        </form.AppField>
        <div>
          <form.AppForm>
            <form.SubmitButton label="Create plan" pendingLabel="Creating…" />
          </form.AppForm>
        </div>
      </form>
    </section>
  )
}
