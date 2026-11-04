import { useState } from 'react'

export type FlashPhase = 'a' | 'b'

export const NOT_LOADED = ''

export function useFlashOnChange(signature: string): FlashPhase | undefined {
  const [seenSignature, setSeenSignature] = useState(signature)
  const [changeCount, setChangeCount] = useState(0)

  if (seenSignature !== signature) {
    setSeenSignature(signature)
    if (seenSignature !== NOT_LOADED) setChangeCount((count) => count + 1)
  }

  if (changeCount === 0) return undefined
  return changeCount % 2 === 0 ? 'b' : 'a'
}
