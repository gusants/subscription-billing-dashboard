import { RETRY_SCHEDULE_DAYS } from '../lib/retry-schedule.ts'

export { RETRY_SCHEDULE_DAYS }
export const MAX_CARD_ATTEMPTS = RETRY_SCHEDULE_DAYS.length + 1
export const BOLETO_DUE_IN_DAYS = 3
export const PIX_EXPIRES_IN_DAYS = 1
export const BOLETO_EXPIRES_AFTER_DUE_DAYS = 2
