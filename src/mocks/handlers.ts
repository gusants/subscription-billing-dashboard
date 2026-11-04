import { http, HttpResponse } from 'msw'
import { apiBaseUrl } from '../lib/env'

export const handlers = [
  http.get(`${apiBaseUrl}/health`, () => HttpResponse.json({ status: 'ok' })),
]
