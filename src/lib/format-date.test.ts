import {
  formatDate,
  formatDateTime,
  formatRelative,
  parseApiDate,
} from './format-date'

describe('date formatting', () => {
  it('reads date-only values as local calendar dates', () => {
    const date = parseApiDate('2026-10-01')

    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([
      2026, 9, 1,
    ])
    expect(formatDate('2026-10-01')).toBe('Oct 1, 2026')
  })

  it('formats timestamps with date and time', () => {
    expect(formatDateTime('2026-11-03T12:00:00.000Z')).toMatch(
      /^Nov 3, 2026, \d{1,2}:00\s?(AM|PM)$/,
    )
  })

  it.each([
    ['2026-11-04T12:00:00.000Z', 'tomorrow'],
    ['2026-11-01T12:00:00.000Z', '2 days ago'],
    ['2026-11-03T15:00:00.000Z', 'in 3 hours'],
    ['2026-11-03T12:00:20.000Z', 'just now'],
    ['2026-09-03T12:00:00.000Z', '2 months ago'],
  ])('describes %s relative to now as %s', (value, expected) => {
    expect(formatRelative(value, new Date('2026-11-03T12:00:00.000Z'))).toBe(
      expected,
    )
  })
})
