import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from './app-providers'
import { createQueryClient } from './lib/query-client'
import { createAppRouter } from './router'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')

const queryClient = createQueryClient()
const router = createAppRouter(queryClient)

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders queryClient={queryClient} router={router} />
  </StrictMode>,
)
