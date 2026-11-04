import { showServerFieldErrors } from '../../components/form/server-field-errors'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { customersApi } from '../../api/endpoints'
import { invalidateAfter } from '../../api/query-keys'
import { useAppForm } from '../../components/form/app-form'
import { notify } from '../../components/toast/toast-queue'
import { Button } from '../../components/ui/button'
import { Modal } from '../../components/ui/modal'

const customerFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter the school or teacher name'),
  email: z.email('Enter a valid billing email'),
})

export function NewCustomerDialog() {
  const [isOpen, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const createCustomer = useMutation({
    mutationFn: customersApi.create,
    meta: { showsFieldErrors: true },
    onSuccess: async (customer) => {
      await invalidateAfter(queryClient, { type: 'customer-created' })
      notify.success('Customer created', customer.name)
    },
  })

  const form = useAppForm({
    defaultValues: { name: '', email: '' },
    validators: { onBlur: customerFormSchema, onSubmit: customerFormSchema },
    onSubmit: async ({ value, formApi }) => {
      const customer = await createCustomer
        .mutateAsync(customerFormSchema.parse(value))
        .catch((error: unknown) => {
          showServerFieldErrors(formApi, error)
          throw error
        })
      formApi.reset()
      setOpen(false)
      void navigate({
        to: '/customers/$customerId',
        params: { customerId: customer.id },
      })
    },
  })

  const close = () => {
    form.reset()
    setOpen(false)
  }

  return (
    <>
      <Button variant="primary" onPress={() => setOpen(true)}>
        <UserPlus aria-hidden size={15} strokeWidth={1.75} />
        New customer
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={(open) => (open ? setOpen(true) : close())}
        title="New customer"
      >
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit().catch(() => undefined)
          }}
          className="flex flex-col gap-4"
        >
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Name"
                placeholder="Escola de Música Allegro"
              />
            )}
          </form.AppField>
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                label="Billing email"
                type="email"
                inputMode="email"
                placeholder="financeiro@allegro.example"
              />
            )}
          </form.AppField>
          <div className="flex justify-end gap-2">
            <Button onPress={close}>Cancel</Button>
            <form.AppForm>
              <form.SubmitButton
                label="Create customer"
                pendingLabel="Creating…"
              />
            </form.AppForm>
          </div>
        </form>
      </Modal>
    </>
  )
}
