import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze()
  expect(
    violations.map(({ id, nodes }) => ({
      id,
      targets: nodes.map((node) => node.target.join(' ')),
    })),
  ).toEqual([])
}

async function openFirstCustomer(page: Page) {
  await page.goto('/customers')
  const stackedLink = page.locator('a[href^="/customers/cus_"]:visible')
  const gridRow = page.getByRole('grid', { name: 'Customers' }).getByRole('row')
  await stackedLink.or(gridRow.nth(1)).first().click()
}

const screens = [
  { name: 'overview', path: '/', ready: 'Delinquency rate' },
  { name: 'customers', path: '/customers', ready: 'Customers' },
  { name: 'plans', path: '/plans', ready: 'Plans' },
]

for (const { name, path, ready } of screens) {
  test(`${name} has no WCAG AA violations`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByText(ready).first()).toBeVisible()
    await page.waitForLoadState('networkidle')
    await expectNoViolations(page)
  })
}

test('customer detail has no WCAG AA violations', async ({ page }) => {
  await openFirstCustomer(page)
  await expect(
    page.getByRole('heading', { name: 'Subscriptions' }),
  ).toBeVisible()
  await page.waitForLoadState('networkidle')
  await expectNoViolations(page)
})

test('simulator has no WCAG AA violations', async ({ page }) => {
  await openFirstCustomer(page)
  await page.getByRole('button', { name: 'Simulator' }).last().click()
  await expect(
    page.getByRole('heading', { name: 'Simulator', level: 2 }),
  ).toBeVisible()
  await expectNoViolations(page)
})

test('dark theme has no WCAG AA violations', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  await expect(page.getByText('Delinquency rate')).toBeVisible()
  await page.waitForLoadState('networkidle')
  await expectNoViolations(page)
})
