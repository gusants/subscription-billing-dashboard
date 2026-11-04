import { useSyncExternalStore } from 'react'

const DESKTOP_QUERY = '(min-width: 64rem)'

function subscribe(onChange: () => void) {
  if (typeof window.matchMedia !== 'function') return () => undefined
  const list = window.matchMedia(DESKTOP_QUERY)
  list.addEventListener('change', onChange)
  return () => list.removeEventListener('change', onChange)
}

function getSnapshot() {
  if (typeof window.matchMedia !== 'function') return true
  return window.matchMedia(DESKTOP_QUERY).matches
}

export function useIsDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true)
}
