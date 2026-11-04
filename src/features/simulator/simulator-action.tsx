import { describeError } from '../../api/error-messages'
import { useActionState, type ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '../../components/ui/button'

export type ActionOutcome = {
  status: 'idle' | 'success' | 'error'
  message: string
}

const IDLE: ActionOutcome = { status: 'idle', message: '' }

type SimulatorActionProps = {
  title: string
  description: string
  submitLabel: string
  isDisabled?: boolean
  run: (formData: FormData) => Promise<string>
  onDone: (title: string, outcome: ActionOutcome) => void
  children?: ReactNode
}

function SubmitAction({
  label,
  isDisabled,
}: {
  label: string
  isDisabled: boolean
}) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      isDisabled={isDisabled}
      isPending={pending}
      className="h-8 px-2.5 whitespace-nowrap"
    >
      {pending ? 'Working…' : label}
    </Button>
  )
}

function errorMessage(error: unknown) {
  return describeError(error).detail
}

export function SimulatorAction({
  title,
  description,
  submitLabel,
  isDisabled = false,
  run,
  onDone,
  children,
}: SimulatorActionProps) {
  const [outcome, formAction] = useActionState(
    async (_previous: ActionOutcome, formData: FormData) => {
      try {
        const next: ActionOutcome = {
          status: 'success',
          message: await run(formData),
        }
        onDone(title, next)
        return next
      } catch (error) {
        const next: ActionOutcome = {
          status: 'error',
          message: errorMessage(error),
        }
        onDone(title, next)
        return next
      }
    },
    IDLE,
  )

  return (
    <form
      action={formAction}
      aria-label={title}
      className="border-border flex flex-col gap-2 rounded-lg border p-3"
    >
      <div className="flex flex-col">
        <h3 className="font-medium">{title}</h3>
        <p className="text-fg-muted text-xs">{description}</p>
      </div>
      {children}
      <div className="flex justify-end">
        <SubmitAction label={submitLabel} isDisabled={isDisabled} />
      </div>
      <p
        role="status"
        className={`text-xs empty:hidden ${outcome.status === 'error' ? 'text-danger' : 'text-fg-muted'}`}
      >
        {outcome.message}
      </p>
    </form>
  )
}
