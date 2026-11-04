const DAYS_IN_ROLLING_PERIOD = 90

export const overviewPeriods = [
  'this-month',
  'last-month',
  'last-90-days',
] as const
export type OverviewPeriod = (typeof overviewPeriods)[number]

export type DateRange = { from: string; to: string }

export const overviewPeriodLabels: Record<OverviewPeriod, string> = {
  'this-month': 'This month',
  'last-month': 'Last month',
  'last-90-days': 'Last 90 days',
}

const comparisonLabels: Record<OverviewPeriod, string> = {
  'this-month': 'vs same days last month',
  'last-month': 'vs the month before',
  'last-90-days': 'vs previous 90 days',
}

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10)
}

function utcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day))
}

function shiftDays(date: Date, days: number) {
  return utcDate(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + days,
  )
}

function sameDayLastMonth(date: Date) {
  const lastDayOfPreviousMonth = utcDate(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    0,
  ).getUTCDate()
  return utcDate(
    date.getUTCFullYear(),
    date.getUTCMonth() - 1,
    Math.min(date.getUTCDate(), lastDayOfPreviousMonth),
  )
}

function monthRange(year: number, month: number): DateRange {
  return {
    from: isoDay(utcDate(year, month, 1)),
    to: isoDay(utcDate(year, month + 1, 0)),
  }
}

export function periodRanges(period: OverviewPeriod, today: Date) {
  const year = today.getUTCFullYear()
  const month = today.getUTCMonth()

  switch (period) {
    case 'this-month':
      return {
        current: { from: isoDay(utcDate(year, month, 1)), to: isoDay(today) },
        previous: {
          from: isoDay(utcDate(year, month - 1, 1)),
          to: isoDay(sameDayLastMonth(today)),
        },
      }
    case 'last-month':
      return {
        current: monthRange(year, month - 1),
        previous: monthRange(year, month - 2),
      }
    case 'last-90-days': {
      const start = shiftDays(today, -(DAYS_IN_ROLLING_PERIOD - 1))
      return {
        current: { from: isoDay(start), to: isoDay(today) },
        previous: {
          from: isoDay(shiftDays(start, -DAYS_IN_ROLLING_PERIOD)),
          to: isoDay(shiftDays(start, -1)),
        },
      }
    }
  }
}

export function comparisonLabel(period: OverviewPeriod) {
  return comparisonLabels[period]
}
