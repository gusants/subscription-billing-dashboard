import { useEffect, useRef } from 'react'

export function useDebouncedCallback<T>(
  callback: (value: T) => void,
  delayMs: number,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const latestCallback = useRef(callback)

  useEffect(() => {
    latestCallback.current = callback
  }, [callback])

  useEffect(() => () => clearTimeout(timer.current), [])

  return (value: T) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => latestCallback.current(value), delayMs)
  }
}
