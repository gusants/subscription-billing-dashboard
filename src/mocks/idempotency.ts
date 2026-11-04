import { DemoApiError } from './db/demo-api-error'

type StoredResponse = { requestBody: string; status: number; body: unknown }

const responses = new Map<string, StoredResponse>()

export const REPLAYED_HEADER = 'Idempotent-Replayed'

export async function withIdempotency(
  key: string | null,
  requestBody: string,
  execute: () => { status: number; body: unknown },
) {
  if (!key) return { ...execute(), replayed: false }
  const stored = responses.get(key)
  if (stored && stored.requestBody !== requestBody) {
    throw new DemoApiError(
      422,
      'Idempotency-Key was already used with a different request body',
    )
  }
  if (stored)
    return { status: stored.status, body: stored.body, replayed: true }
  const result = execute()
  responses.set(key, { requestBody, ...result })
  return { ...result, replayed: false }
}

export function clearIdempotencyKeys() {
  responses.clear()
}
