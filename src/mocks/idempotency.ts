import { DemoApiError } from './db/demo-api-error'

type StoredResponse = { requestBody: string; status: number; body: unknown }

type ExecutedResponse<Body> = { status: number; body: Body }

const responses = new Map<string, StoredResponse>()

export const REPLAYED_HEADER = 'Idempotent-Replayed'

export async function withIdempotency<Body>(
  key: string | null,
  requestBody: string,
  execute: () => ExecutedResponse<Body>,
) {
  if (!key) return { ...execute(), replayed: false }
  const stored = responses.get(key)
  if (stored && stored.requestBody !== requestBody) {
    throw new DemoApiError(
      422,
      'Idempotency-Key was already used with a different request',
    )
  }
  if (stored)
    return {
      status: stored.status,
      body: stored.body as Body,
      replayed: true,
    }
  const result = execute()
  responses.set(key, { requestBody, ...result })
  return { ...result, replayed: false }
}

export function clearIdempotencyKeys() {
  responses.clear()
}
