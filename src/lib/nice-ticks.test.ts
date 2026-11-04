import { niceTicks } from './nice-ticks'

describe('niceTicks', () => {
  it.each([
    [1_235_670, [0, 500_000, 1_000_000, 1_500_000]],
    [380, [0, 100, 200, 300, 400]],
    [0, [0]],
  ])('rounds %i up to clean steps', (max, ticks) => {
    expect(niceTicks(max)).toEqual(ticks)
  })
})
