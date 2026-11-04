import { useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useState } from 'react'
import { Button, Heading } from 'react-aria-components'
import { simulatorApi } from '../../api/endpoints'
import { invalidateAfter, type BillingEvent } from '../../api/query-keys'
import { isDemoMode } from '../../lib/env'
import { useUiPreferences } from '../../lib/ui-preferences'
import { demoFlags } from '../../mocks/demo-flags'
import { DemoSwitch } from './demo-switch'
import { SimulatorAction, type ActionOutcome } from './simulator-action'
import { SimulatorLog, type LogEntry } from './simulator-log'
import { TargetSelect } from './target-select'
import { useSimulatorTargets } from './use-simulator-targets'
import { waitForSettlement } from './wait-for-settlement'

const MAX_LOG_ENTRIES = 5
const NO_CUSTOMER = 'Open a customer to target their charges.'
const NOT_SETTLED_YET =
  'Done at the gateway. The API has not confirmed it yet; refresh in a moment.'
const LIVE_API_NOTES = {
  retries:
    'Not in the live API yet. Its queue runs scheduled retries on its own.',
  reset: 'Only demo data can be reset. The live API keeps its own database.',
  apiError: 'Demo only. In live mode, real API errors show up as they happen.',
  llmFailure:
    'Demo only. In live mode, the API falls back when its AI provider fails.',
}

function liveApiNote(note: string) {
  return isDemoMode ? undefined : note
}

function formValue(formData: FormData, name: string) {
  const value = formData.get(name)
  if (typeof value !== 'string' || !value)
    throw new Error('Choose a target first')
  return value
}

export function SimulatorPanel() {
  const setSimulatorOpen = useUiPreferences((state) => state.setSimulatorOpen)
  const queryClient = useQueryClient()
  const targets = useSimulatorTargets()
  const [log, setLog] = useState<LogEntry[]>([])
  const [isFailing, setFailing] = useState(
    () => demoFlags.getState().isFailingRequests,
  )
  const [isLlmFailing, setLlmFailing] = useState(
    () => demoFlags.getState().isLlmFailing,
  )

  const record = (title: string, outcome: ActionOutcome) =>
    setLog((entries) =>
      [{ id: Date.now(), title, outcome }, ...entries].slice(
        0,
        MAX_LOG_ENTRIES,
      ),
    )
  const refresh = (event: BillingEvent) => invalidateAfter(queryClient, event)
  const settle = (chargeId: string) =>
    targets.customerId
      ? waitForSettlement(targets.customerId, chargeId)
      : Promise.resolve(true)
  const customerEvent = (
    type: 'charge-paid' | 'charge-expired',
  ): BillingEvent =>
    targets.customerId
      ? { type, customerId: targets.customerId }
      : { type: 'retries-run' }

  const toggleFailures = (isSelected: boolean) => {
    demoFlags.getState().setFailingRequests(isSelected)
    setFailing(isSelected)
    record('Simulate API error', {
      status: 'success',
      message: isSelected
        ? 'Every request now fails with 503'
        : 'Requests succeed again',
    })
    void refresh({ type: 'demo-reset' })
  }

  const toggleLlmFailure = (isSelected: boolean) => {
    demoFlags.getState().setLlmFailing(isSelected)
    setLlmFailing(isSelected)
    record('Simulate LLM failure', {
      status: 'success',
      message: isSelected
        ? 'Summaries now use the rule-based fallback'
        : 'Summaries use the AI model again',
    })
  }

  return (
    <>
      <div
        aria-hidden
        onClick={() => setSimulatorOpen(false)}
        className="bg-fg/30 fixed inset-0 z-10 lg:hidden"
      />
      <aside
        aria-labelledby="simulator-heading"
        className="border-border bg-surface shadow-panel fixed inset-y-0 right-0 z-20 flex w-[min(20rem,100vw)] flex-col border-l lg:sticky lg:top-0 lg:h-dvh lg:shadow-none"
      >
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <div className="flex flex-col">
            <Heading id="simulator-heading" level={2} className="font-semibold">
              Simulator
            </Heading>
            <span className="text-fg-muted text-xs">
              {targets.customerName ?? 'No customer selected'}
            </span>
          </div>
          <Button
            aria-label="Close simulator"
            onPress={() => setSimulatorOpen(false)}
            className="text-fg-subtle hover:bg-surface-muted hover:text-fg grid size-7 cursor-default place-items-center rounded-md transition-colors"
          >
            <X aria-hidden size={16} strokeWidth={1.75} />
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
          <SimulatorAction
            title="Approve Pix"
            description="The customer pays a pending Pix charge."
            submitLabel="Approve"
            isDisabled={targets.pendingPix.length === 0}
            onDone={record}
            run={async (formData) => {
              const chargeId = formValue(formData, 'chargeId')
              await simulatorApi.payCharge(chargeId)
              const isSettled = await settle(chargeId)
              await refresh(customerEvent('charge-paid'))
              return isSettled ? 'Pix payment approved' : NOT_SETTLED_YET
            }}
          >
            <TargetSelect
              name="chargeId"
              label="Pending Pix charge"
              options={targets.pendingPix}
              emptyLabel={
                targets.customerId
                  ? 'No pending Pix charge for this customer.'
                  : NO_CUSTOMER
              }
            />
          </SimulatorAction>

          <SimulatorAction
            title="Expire boleto"
            description="A pending boleto passes its due date unpaid."
            submitLabel="Expire"
            isDisabled={targets.pendingBoleto.length === 0}
            onDone={record}
            run={async (formData) => {
              const chargeId = formValue(formData, 'chargeId')
              await simulatorApi.expireCharge(chargeId)
              const isSettled = await settle(chargeId)
              await refresh(customerEvent('charge-expired'))
              return isSettled
                ? 'Boleto expired, a new one is scheduled'
                : NOT_SETTLED_YET
            }}
          >
            <TargetSelect
              name="chargeId"
              label="Pending boleto"
              options={targets.pendingBoleto}
              emptyLabel={
                targets.customerId
                  ? 'No pending boleto for this customer.'
                  : NO_CUSTOMER
              }
            />
          </SimulatorAction>

          <SimulatorAction
            title="Force card decline"
            description="The card on file starts declining for insufficient funds."
            submitLabel="Force decline"
            isDisabled={targets.cardSubscriptions.length === 0}
            onDone={record}
            run={async (formData) => {
              const subscriptionId = formValue(formData, 'subscriptionId')
              await simulatorApi.setSubscriptionCard(
                subscriptionId,
                'tok_insufficient_funds',
              )
              await refresh({ type: 'card-changed', subscriptionId })
              return 'The next card attempt will be declined'
            }}
          >
            <TargetSelect
              name="subscriptionId"
              label="Card subscription"
              options={targets.cardSubscriptions}
              emptyLabel={
                targets.customerId
                  ? 'This customer has no card subscription.'
                  : NO_CUSTOMER
              }
            />
          </SimulatorAction>

          <SimulatorAction
            title="Advance retry clock"
            description="Run every scheduled retry now (D+1, D+3, D+7)."
            submitLabel="Run retries"
            unavailableReason={liveApiNote(LIVE_API_NOTES.retries)}
            onDone={record}
            run={async () => {
              const { promoted } = await simulatorApi.runRetriesNow()
              await refresh({ type: 'retries-run' })
              return promoted === 1
                ? 'Ran 1 scheduled retry'
                : `Ran ${promoted} scheduled retries`
            }}
          />

          <SimulatorAction
            title="Reset demo"
            description="Restore the original demo data."
            submitLabel="Reset"
            unavailableReason={liveApiNote(LIVE_API_NOTES.reset)}
            onDone={record}
            run={async () => {
              await simulatorApi.reset()
              await refresh({ type: 'demo-reset' })
              return 'Demo data restored'
            }}
          />

          <DemoSwitch
            label="Simulate API error"
            description={
              liveApiNote(LIVE_API_NOTES.apiError) ??
              'Every request fails, to show error states.'
            }
            isSelected={isFailing}
            isDisabled={!isDemoMode}
            onChange={toggleFailures}
          />
          <DemoSwitch
            label="Simulate LLM failure"
            description={
              liveApiNote(LIVE_API_NOTES.llmFailure) ??
              'AI summaries fall back to rules.'
            }
            isSelected={isLlmFailing}
            isDisabled={!isDemoMode}
            onChange={toggleLlmFailure}
          />

          <SimulatorLog entries={log} />
        </div>
      </aside>
    </>
  )
}
