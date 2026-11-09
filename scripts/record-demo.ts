import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, readFileSync, renameSync, rmSync } from 'node:fs'
import { chromium, type Page } from '@playwright/test'

type Seed = {
  subscriptions: { id: string; customerId: string; status: string }[]
  charges: { subscriptionId: string; status: string; method: string }[]
}

const PORT = 4174
const BASE_URL = `http://localhost:${PORT}`
const VIEWPORT = { width: 1280, height: 800 }
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }
const MEDIA_DIR = new URL('../docs/media/', import.meta.url).pathname
const VIDEO_DIR = `${MEDIA_DIR}.video/`
const GIF_WIDTH = 880
const GIF_FPS = 10

function readSeed() {
  return JSON.parse(
    readFileSync(new URL('../src/mocks/seed.json', import.meta.url), 'utf8'),
  ) as Seed
}

function customerWithFailedCard() {
  const seed = readSeed()
  const charge = seed.charges.find(
    (candidate) => candidate.method === 'card' && candidate.status === 'failed',
  )
  const subscription = seed.subscriptions.find(
    (candidate) => candidate.id === charge?.subscriptionId,
  )
  if (!subscription) throw new Error('The seed has no failed card charge')
  return subscription.customerId
}

function customerWithPendingPix() {
  const seed = readSeed()
  const incomplete = new Map(
    seed.subscriptions
      .filter((subscription) => subscription.status === 'incomplete')
      .map((subscription) => [subscription.id, subscription.customerId]),
  )
  const charge = seed.charges.find(
    (candidate) =>
      candidate.method === 'pix' &&
      candidate.status === 'pending' &&
      incomplete.has(candidate.subscriptionId),
  )
  if (!charge) throw new Error('The seed has no incomplete Pix subscription')
  return incomplete.get(charge.subscriptionId)!
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const ready = await fetch(BASE_URL).then(
      (response) => response.ok,
      () => false,
    )
    if (ready) return
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`The preview server did not start on ${BASE_URL}`)
}

async function settle(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(600)
}

async function capture(page: Page, path: string, file: string) {
  await page.goto(`${BASE_URL}${path}`)
  await settle(page)
  await page.screenshot({ path: `${MEDIA_DIR}${file}` })
}

async function captureScreens(page: Page, pastDueId: string) {
  await capture(page, '/', 'overview.png')
  await capture(page, '/customers', 'customers.png')
  await capture(page, '/plans', 'plans.png')

  await page.goto(`${BASE_URL}/customers/${pastDueId}`)
  await settle(page)
  await page.getByRole('button', { name: 'Generate summary' }).click()
  await page.getByText('Suggested action').first().waitFor()
  await settle(page)
  await page.screenshot({ path: `${MEDIA_DIR}customer-detail.png` })
}

async function captureSimulator(page: Page, pixCustomerId: string) {
  await page.goto(`${BASE_URL}/customers/${pixCustomerId}`)
  await settle(page)
  await page.getByRole('button', { name: 'Simulator' }).last().click()
  await settle(page)
  await page.screenshot({ path: `${MEDIA_DIR}simulator.png` })
}

async function recordSimulator(page: Page, customerId: string) {
  await page.goto(`${BASE_URL}/customers/${customerId}`)
  await settle(page)
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: 'Simulator' }).last().click()
  await page.waitForTimeout(1200)
  await page
    .getByRole('form', { name: 'Approve Pix' })
    .getByRole('button', { name: 'Approve' })
    .click()
  await page.getByText('Pix payment approved').first().waitFor()
  await page.waitForTimeout(2500)
  await page.getByRole('link', { name: 'Overview', exact: true }).click()
  await settle(page)
  await page.waitForTimeout(2000)
}

function convertToGif(video: string) {
  const filters = `fps=${GIF_FPS},scale=${GIF_WIDTH}:-1:flags=lanczos`
  execFileSync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-i',
    video,
    '-vf',
    `${filters},split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5`,
    `${MEDIA_DIR}simulator.gif`,
  ])
}

async function main() {
  mkdirSync(MEDIA_DIR, { recursive: true })
  execFileSync('pnpm', ['build'], {
    stdio: 'inherit',
    env: { ...process.env, VITE_API_MODE: 'demo' },
  })
  const server = spawn(
    'pnpm',
    ['preview', '--port', String(PORT), '--strictPort'],
    {
      stdio: 'ignore',
    },
  )
  const browser = await chromium.launch()
  try {
    await waitForServer()
    const customerId = customerWithPendingPix()
    const pastDueId = customerWithFailedCard()

    const screensContext = await browser.newContext({ viewport: VIEWPORT })
    await captureScreens(await screensContext.newPage(), pastDueId)
    await screensContext.close()

    const simulatorContext = await browser.newContext({ viewport: VIEWPORT })
    await captureSimulator(await simulatorContext.newPage(), customerId)
    await simulatorContext.close()

    const darkContext = await browser.newContext({
      viewport: VIEWPORT,
      colorScheme: 'dark',
    })
    await capture(await darkContext.newPage(), '/', 'overview-dark.png')
    await darkContext.close()

    const mobileContext = await browser.newContext(MOBILE)
    await capture(
      await mobileContext.newPage(),
      `/customers/${pastDueId}`,
      'customer-detail-mobile.png',
    )
    await mobileContext.close()

    const videoContext = await browser.newContext({
      viewport: VIEWPORT,
      recordVideo: { dir: VIDEO_DIR, size: VIEWPORT },
    })
    const page = await videoContext.newPage()
    await recordSimulator(page, customerId)
    await videoContext.close()
    const video = await page.video()!.path()
    renameSync(video, `${VIDEO_DIR}simulator.webm`)
    convertToGif(`${VIDEO_DIR}simulator.webm`)
  } finally {
    await browser.close()
    server.kill()
    rmSync(VIDEO_DIR, { recursive: true, force: true })
  }
  console.log(`Media written to ${MEDIA_DIR}`)
}

await main()
