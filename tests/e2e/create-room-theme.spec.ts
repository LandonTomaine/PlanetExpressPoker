import { expect, test } from '@playwright/test'

test('landing page creates a new room with the selected theme', async ({
  page,
}) => {
  const roomName = `theme-e2e-${Date.now()}`

  await page.goto('/')
  await page.getByLabel('Room name').fill(roomName)
  await page.getByLabel('Your name').fill('Judy E2E')
  await page.getByLabel('New room theme').selectOption({ label: 'Zootopia' })
  await page.getByRole('button', { name: 'Join as voter' }).click()

  await expect(page).toHaveURL(new RegExp(`/rooms/${roomName}`))
  await expect(page.getByText('Connected')).toBeVisible()
  await expect(page.getByLabel('Room theme')).toHaveValue('zootopia')
  await expect(page.getByText('Theme: Zootopia')).toBeVisible()

  await page.waitForTimeout(750)
  await expect(page.getByLabel('Room theme')).toHaveValue('zootopia')
})
