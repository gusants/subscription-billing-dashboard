import { z } from 'zod'
import { overviewPeriods } from './overview-period'

export const DEFAULT_OVERVIEW_PERIOD = 'this-month'

export const overviewSearchSchema = z.object({
  period: z
    .enum(overviewPeriods)
    .default(DEFAULT_OVERVIEW_PERIOD)
    .catch(DEFAULT_OVERVIEW_PERIOD),
})
