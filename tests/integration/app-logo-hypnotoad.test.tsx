import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../../src/app/App'

describe('App logo Hypnotoad trigger', () => {
  it('dispatches the Hypnotoad event for touch activation without double-counting the synthetic click', async () => {
    const user = userEvent.setup()
    const hypnotoadListener = vi.fn()

    window.addEventListener('pep:hypnotoad-logo-click', hypnotoadListener)

    renderAppShell()

    const logoButton = screen.getByRole('button', {
      name: 'Planet Express logo',
    })

    fireEvent.touchEnd(logoButton)
    await user.click(logoButton)

    expect(hypnotoadListener).toHaveBeenCalledTimes(1)

    window.removeEventListener('pep:hypnotoad-logo-click', hypnotoadListener)
  })
})

function renderAppShell() {
  render(
    <MemoryRouter initialEntries={['/rooms/demo-room']}>
      <Routes>
        <Route element={<App />}>
          <Route path="/rooms/:roomName" element={<div>Room page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}
