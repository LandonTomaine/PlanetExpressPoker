import { expect, test } from '@playwright/test'

test('simulator room supports join, voting, reveal, and result summary', async ({
  page,
}) => {
  const roomName = `e2e-${Date.now()}`

  await page.goto(`/rooms/${roomName}/dev`)

  const joinDialog = page.getByRole('dialog', { name: roomName })
  await joinDialog.getByPlaceholder('Hermes').fill('Leela E2E')
  await joinDialog.getByRole('button', { name: 'Join as voter' }).click()

  await expect(page.getByText('Connected')).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 3, name: 'Leela E2E' })
  ).toBeVisible()

  await page.getByRole('button', { name: 'Spawn fake user' }).click()
  await expect(page.getByRole('button', { name: 'Simulate vote' })).toHaveCount(
    1
  )

  await page.getByRole('button', { name: 'Simulate vote' }).click()
  const simulateVoteDialog = page.getByRole('dialog', { name: /^Dev-/ })
  await simulateVoteDialog
    .getByRole('button', { exact: true, name: '3' })
    .click()
  await expect(simulateVoteDialog).toBeHidden()

  await page.getByRole('button', { exact: true, name: '3 card' }).click()
  await expect(page.getByText('Your vote: 3')).toBeVisible()

  await page.getByRole('button', { name: 'Reveal' }).click()

  await expect(page.getByText('Round 1 results')).toBeVisible()
  await expect(
    page.getByText('Everyone matched on the same estimate.')
  ).toBeVisible()

  const pageText = await page.locator('main').innerText()
  expect(pageText).toMatch(/2 numeric votes/i)
  expect(pageText).toMatch(/recommended\s+3/i)
})
