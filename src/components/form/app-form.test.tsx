import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'
import { useAppForm } from './app-form'

const schema = z.object({
  email: z.email('Enter a valid email'),
  method: z.enum(['pix', 'card'], 'Choose a method'),
})

function ExampleForm({
  onSubmit,
}: {
  onSubmit: (value: z.infer<typeof schema>) => void
}) {
  const form = useAppForm({
    defaultValues: { email: '', method: '' } as {
      email: string
      method: string
    },
    validators: { onBlur: schema, onSubmit: schema },
    onSubmit: ({ value }) => onSubmit(schema.parse(value)),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.AppField name="email">
        {(field) => <field.TextField label="Email" type="email" />}
      </form.AppField>
      <form.AppField name="method">
        {(field) => (
          <field.RadioCardsField
            label="Method"
            options={[
              { id: 'pix', label: 'Pix', description: 'Instant' },
              { id: 'card', label: 'Card', description: 'Recurring' },
            ]}
          />
        )}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton label="Save" pendingLabel="Saving…" />
      </form.AppForm>
    </form>
  )
}

describe('form primitives', () => {
  it('validates on blur and links the error to the field', async () => {
    const user = userEvent.setup()
    render(<ExampleForm onSubmit={vi.fn()} />)

    await user.type(
      screen.getByRole('textbox', { name: 'Email' }),
      'not-an-email',
    )
    await user.tab()

    const email = screen.getByRole('textbox', { name: 'Email' })
    await waitFor(() => expect(email).toHaveAttribute('aria-invalid', 'true'))
    expect(email).toHaveAccessibleDescription('Enter a valid email')
  })

  it('blocks submit until valid and then submits the parsed value', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ExampleForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(await screen.findByText('Choose a method')).toBeInTheDocument()

    await user.type(
      screen.getByRole('textbox', { name: 'Email' }),
      'ops@allegro.example',
    )
    await user.click(screen.getByRole('radio', { name: /Pix/ }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'ops@allegro.example',
        method: 'pix',
      }),
    )
  })
})
