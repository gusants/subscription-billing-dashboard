import { z } from 'zod'

const envSchema = z.object({
  VITE_API_MODE: z.enum(['demo', 'api']).default('demo'),
})

const env = envSchema.parse(import.meta.env)

export const apiMode = env.VITE_API_MODE
export const isDemoMode = apiMode === 'demo'
export const apiBaseUrl = '/api'
