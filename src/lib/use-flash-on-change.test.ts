import { renderHook } from '@testing-library/react'
import { NOT_LOADED, useFlashOnChange } from './use-flash-on-change'

describe('useFlashOnChange', () => {
  it('stays still on first render and alternates phases on each change', () => {
    const { result, rerender } = renderHook(
      ({ signature }) => useFlashOnChange(signature),
      { initialProps: { signature: 'pending' } },
    )

    expect(result.current).toBeUndefined()
    rerender({ signature: 'pending' })
    expect(result.current).toBeUndefined()
    rerender({ signature: 'paid' })
    expect(result.current).toBe('a')
    rerender({ signature: 'refunded' })
    expect(result.current).toBe('b')
  })

  it('does not flash when data first arrives', () => {
    const { result, rerender } = renderHook(
      ({ signature }) => useFlashOnChange(signature),
      { initialProps: { signature: NOT_LOADED } },
    )

    rerender({ signature: 'R$ 389,90' })

    expect(result.current).toBeUndefined()
  })
})
