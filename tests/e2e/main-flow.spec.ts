import { expect, test, type Locator, type Page } from '@playwright/test'

test.use({ viewport: { width: 1440, height: 900 } })
test.skip(({ isMobile }) => isMobile, 'the main flow runs on desktop')

function kpiValue(page: Page, label: string) {
  return page
    .locator('dt', { hasText: label })
    .locator('xpath=following-sibling::dd[1]/span[1]')
}

async function readPercent(page: Page, label: string) {
  const text = (await kpiValue(page, label).textContent()) ?? ''
  return Number.parseFloat(text.replace(',', '.'))
}

async function readInteger(page: Page, label: string) {
  const text = (await kpiValue(page, label).textContent()) ?? ''
  return Number.parseInt(text.replace(/\D/g, ''), 10)
}

async function choose(
  page: Page,
  dialog: Locator,
  label: RegExp,
  option: RegExp,
) {
  const choice = page.getByRole('option', { name: option })
  await expect(async () => {
    await dialog.getByRole('button', { name: label }).click()
    await expect(choice).toBeVisible({ timeout: 1_000 })
  }).toPass()
  await choice.click()
}

async function openOverview(page: Page) {
  await page.getByRole('link', { name: 'Overview', exact: true }).click()
  await expect(kpiValue(page, 'Delinquency rate')).toBeVisible()
}

test('a declined card turns past due and a retry brings it back', async ({
  page,
}) => {
  await page.goto('/')
  await expect(kpiValue(page, 'Delinquency rate')).toBeVisible()
  const delinquencyBefore = await readPercent(page, 'Delinquency rate')
  const pastDueBefore = await readInteger(page, 'Past due subscriptions')

  await page.getByRole('link', { name: 'Customers', exact: true }).click()
  await page.getByRole('button', { name: 'New customer' }).click()
  const customerDialog = page.getByRole('dialog', { name: 'New customer' })
  await customerDialog.getByLabel('Name').fill('Escola E2E')
  await customerDialog.getByLabel('Billing email').fill('ops@e2e.example')
  await customerDialog.getByRole('button', { name: 'Create customer' }).click()
  await expect(page.getByRole('heading', { name: 'Escola E2E' })).toBeVisible()

  await page.getByRole('button', { name: 'New subscription' }).click()
  const subscriptionDialog = page.getByRole('dialog', {
    name: 'New subscription',
  })
  await choose(page, subscriptionDialog, /Plan/, /^Studio · /)
  await choose(
    page,
    subscriptionDialog,
    /Test card/,
    /Declines once, then approves/,
  )
  await subscriptionDialog
    .getByRole('button', { name: 'Create subscription' })
    .click()
  await expect(
    page.getByText('Subscription created, first charge declined'),
  ).toBeVisible()

  const subscriptions = page.getByRole('region', { name: 'Subscriptions' })
  await expect(subscriptions.getByText('Past due')).toBeVisible()

  await openOverview(page)
  await expect
    .poll(() => readInteger(page, 'Past due subscriptions'))
    .toBe(pastDueBefore + 1)
  await expect
    .poll(() => readPercent(page, 'Delinquency rate'))
    .toBeGreaterThan(delinquencyBefore)
  const delinquencyAfterDecline = await readPercent(page, 'Delinquency rate')

  await page.getByRole('link', { name: 'Customers', exact: true }).click()
  await page.getByRole('link', { name: /Escola E2E/ }).click()
  await page.getByRole('button', { name: 'Simulator' }).last().click()
  const retryClock = page.getByRole('form', { name: 'Advance retry clock' })
  await retryClock.getByRole('button', { name: 'Run retries' }).click()
  await expect(retryClock.getByRole('status')).toHaveText(
    /Ran \d+ scheduled retr/,
  )
  await page.getByRole('button', { name: 'Close simulator' }).click()
  await expect(subscriptions.getByText('Active')).toBeVisible()

  await openOverview(page)
  await expect
    .poll(() => readInteger(page, 'Past due subscriptions'))
    .toBeLessThan(pastDueBefore + 1)
  await expect
    .poll(() => readPercent(page, 'Delinquency rate'))
    .toBeLessThan(delinquencyAfterDecline)
})
