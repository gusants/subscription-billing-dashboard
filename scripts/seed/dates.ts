const DAY_MS = 86_400_000

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS)
}

export function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 3_600_000)
}

export function addMonths(date: Date, months: number) {
  const result = new Date(date)
  const day = result.getUTCDate()
  result.setUTCDate(1)
  result.setUTCMonth(result.getUTCMonth() + months)
  const daysInMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate()
  result.setUTCDate(Math.min(day, daysInMonth))
  return result
}

export function atHour(date: Date, hour: number) {
  const result = new Date(date)
  result.setUTCHours(hour, 0, 0, 0)
  return result
}
