import { isDemoMode } from '../lib/env'

export async function enableDemoMode() {
  if (!isDemoMode) return
  const { worker } = await import('./browser')
  await worker.start({
    onUnhandledFrame: 'bypass',
    quiet: true,
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  })
}
