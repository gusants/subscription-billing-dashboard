import { z } from 'zod'

const DEMO_API_BASE_URL = '/api'

const envSchema = z.object({
  VITE_API_MODE: z.enum(['demo', 'api']).default('demo'),
  VITE_API_URL: z.url().default('http://localhost:3000'),
})

const env = envSchema.parse(import.meta.env)

export const apiMode = env.VITE_API_MODE
export const isDemoMode = apiMode === 'demo'
export const apiBaseUrl = isDemoMode ? DEMO_API_BASE_URL : env.VITE_API_URL
