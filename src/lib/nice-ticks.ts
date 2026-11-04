const NICE_FACTORS = [1, 2, 2.5, 5, 10]
const DEFAULT_TICK_COUNT = 4

export function niceTicks(maxValue: number, tickCount = DEFAULT_TICK_COUNT) {
  if (maxValue <= 0) return [0]
  const roughStep = maxValue / tickCount
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const factor =
    NICE_FACTORS.find((candidate) => candidate * magnitude >= roughStep) ?? 10
  const step = factor * magnitude
  const top = Math.ceil(maxValue / step) * step
  return Array.from(
    { length: Math.round(top / step) + 1 },
    (_, index) => index * step,
  )
}
