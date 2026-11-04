export type Random = {
  next: () => number
  int: (min: number, max: number) => number
  pick: <T>(items: readonly T[]) => T
  chance: (probability: number) => boolean
  id: (prefix: string) => string
}

const UINT32_RANGE = 4294967296
const ID_LENGTH = 12
const ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'

function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE
  }
}

export function createRandom(seed: number): Random {
  const next = mulberry32(seed)
  const int = (min: number, max: number) =>
    min + Math.floor(next() * (max - min + 1))
  const pick = <T>(items: readonly T[]) => {
    const item = items[int(0, items.length - 1)]
    if (item === undefined) throw new Error('Cannot pick from an empty list')
    return item
  }
  const id = (prefix: string) =>
    `${prefix}_${Array.from({ length: ID_LENGTH }, () => pick([...ID_ALPHABET])).join('')}`

  return { next, int, pick, chance: (probability) => next() < probability, id }
}
