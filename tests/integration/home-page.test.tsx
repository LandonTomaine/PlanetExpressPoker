import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useParams } from 'react-router'
import { describe, expect, it } from 'vitest'
import { HomePage } from '../../src/routes/HomePage'

describe('HomePage', () => {
  it('creates or joins a room after name, room, and avatar selection', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms/:roomName" element={<OpenedRoom />} />
        </Routes>
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Room name'), ' demo-room ')
    await user.type(screen.getByLabelText('Your name'), '  Amy  ')
    await user.click(screen.getByRole('button', { name: 'Use Bender avatar' }))
    await user.click(
      screen.getByRole('button', { name: 'Create or join room' })
    )

    expect(screen.getByText('Opened demo-room')).toBeInTheDocument()
    expect(window.sessionStorage.getItem('pep.active-room.v1')).toBe(
      'demo-room'
    )
    expect(window.localStorage.getItem('pep.identity.v1')).toContain(
      '"displayName":"Amy"'
    )
    expect(window.localStorage.getItem('pep.identity.v1')).toContain(
      '"avatarKey":"bender"'
    )
  })
})

function OpenedRoom() {
  const { roomName } = useParams()

  return <div>Opened {roomName}</div>
}
