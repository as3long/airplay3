import { test, expect } from '@playwright/test'

test.describe('Player UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should display title bar with drag region', async ({ page }) => {
    const titleBar = page.locator('[data-tauri-drag-region]').first()
    await expect(titleBar).toBeVisible()
  })

  test('should display app title', async ({ page }) => {
    await expect(page.locator('.title')).toContainText('AirPlay3')
  })

  test('should show window control buttons', async ({ page }) => {
    await expect(page.locator('[data-testid="minimize"]')).toBeVisible()
    await expect(page.locator('[data-testid="maximize"]')).toBeVisible()
    await expect(page.locator('[data-testid="close"]')).toBeVisible()
  })

  test('should show play button', async ({ page }) => {
    const playButton = page.locator('[data-testid="play-button"]')
    await expect(playButton).toBeVisible()
  })

  test('should toggle play state on button click', async ({ page }) => {
    const playButton = page.locator('[data-testid="play-button"]')
    await expect(playButton).toContainText('▶')
    await playButton.click()
    await expect(playButton).toContainText('⏸')
    await playButton.click()
    await expect(playButton).toContainText('▶')
  })

  test('should show prev and next buttons', async ({ page }) => {
    await expect(page.locator('[data-testid="prev-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="next-btn"]')).toBeVisible()
  })

  test('should display progress bar', async ({ page }) => {
    const progressBar = page.locator('[data-testid="progress-bar"]')
    await expect(progressBar).toBeVisible()
  })

  test('should display time indicators', async ({ page }) => {
    await expect(page.locator('[data-testid="current-time"]')).toContainText('0:00')
    await expect(page.locator('[data-testid="total-time"]')).toContainText('0:00')
  })

  test('should display volume control', async ({ page }) => {
    await expect(page.locator('[data-testid="volume-slider"]')).toBeVisible()
    await expect(page.locator('[data-testid="volume-value"]')).toContainText('100%')
  })

  test('should toggle mute on volume icon click', async ({ page }) => {
    const muteBtn = page.locator('[data-testid="mute-btn"]')
    const volumeValue = page.locator('[data-testid="volume-value"]')
    await muteBtn.click()
    await expect(volumeValue).toContainText('0%')
    await muteBtn.click()
    await expect(volumeValue).toContainText('100%')
  })

  test('should adjust volume via slider', async ({ page }) => {
    const slider = page.locator('[data-testid="volume-slider"]')
    await slider.fill('50')
    await expect(page.locator('[data-testid="volume-value"]')).toContainText('50%')
  })

  test('should show default state when no track loaded', async ({ page }) => {
    await expect(page.locator('.track-info h2')).toContainText('No Track Loaded')
  })
})
