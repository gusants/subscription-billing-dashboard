import { useRef } from 'react'

type KeyedRequest = { key: string; body: string }

export function useIdempotencyKey() {
  const current = useRef<KeyedRequest | null>(null)

  return {
    keyFor(body: unknown) {
      const serialized = JSON.stringify(body)
      if (current.current?.body !== serialized) {
        current.current = { key: crypto.randomUUID(), body: serialized }
      }
      return current.current.key
    },
    rotate() {
      current.current = null
    },
  }
}
