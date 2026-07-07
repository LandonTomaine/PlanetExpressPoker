import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RoomsPage } from '../../src/routes/RoomsPage'
import { listRooms, shutdownRoom } from '../../src/features/room/data/roomApi'

vi.mock('../../src/features/room/data/roomApi', () => ({
  listRooms: vi.fn(),
  shutdownRoom: vi.fn(),
}))

vi.mock('../../src/features/room/realtime/useRoomPresenceCounts', () => ({
  useRoomPresenceCounts: vi.fn(() => ({
    'owner-room': 2,
    'guest-room': 1,
  })),
}))

beforeEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
  vi.clearAllMocks()
  vi.mocked(shutdownRoom).mockResolvedValue({ result_room_id: 'closed-room' })
})

describe('RoomsPage', () => {
  it('shows close controls for any room on the rooms page', async () => {
    vi.mocked(listRooms).mockResolvedValue([
      {
        roomId: 'room-1',
        roomName: 'owner-room',
        participantCount: 4,
        currentClientRole: 'voter',
        isCurrentClientOwner: true,
        updatedAt: new Date().toISOString(),
      },
      {
        roomId: 'room-2',
        roomName: 'guest-room',
        participantCount: 2,
        currentClientRole: 'spectator',
        isCurrentClientOwner: false,
        updatedAt: new Date().toISOString(),
      },
    ])

    render(
      <MemoryRouter initialEntries={['/rooms']}>
        <Routes>
          <Route path="/rooms" element={<RoomsPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('owner-room')).toBeInTheDocument()
    expect(screen.getByText('guest-room')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Close room' })).toHaveLength(
      2
    )
    expect(screen.getAllByRole('button', { name: 'Open room' })).toHaveLength(2)
  })

  it('closes an owned room without requiring a PIN', async () => {
    vi.mocked(listRooms).mockResolvedValue([
      {
        roomId: 'room-1',
        roomName: 'owner-room',
        participantCount: 4,
        currentClientRole: 'voter',
        isCurrentClientOwner: true,
        updatedAt: new Date().toISOString(),
      },
    ])

    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/rooms']}>
        <Routes>
          <Route path="/rooms" element={<RoomsPage />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findByText('owner-room')
    await user.click(screen.getByRole('button', { name: 'Close room' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Close room',
      })
    )

    expect(vi.mocked(shutdownRoom)).toHaveBeenCalledWith({
      roomId: 'room-1',
      actorClientId: expect.any(String),
      shutdownPin: null,
    })
  })

  it('requires a PIN to close someone else’s room', async () => {
    vi.mocked(listRooms).mockResolvedValue([
      {
        roomId: 'room-2',
        roomName: 'guest-room',
        participantCount: 2,
        currentClientRole: 'spectator',
        isCurrentClientOwner: false,
        updatedAt: new Date().toISOString(),
      },
    ])

    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/rooms']}>
        <Routes>
          <Route path="/rooms" element={<RoomsPage />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findByText('guest-room')
    await user.click(screen.getByRole('button', { name: 'Close room' }))

    const dialog = screen.getByRole('dialog')
    const confirmButton = within(dialog).getByRole('button', {
      name: 'Close room',
    })

    expect(confirmButton).toBeDisabled()

    await user.type(
      within(dialog).getByPlaceholderText('Enter room shutdown PIN'),
      'test-pin'
    )
    await user.click(confirmButton)

    expect(vi.mocked(shutdownRoom)).toHaveBeenCalledWith({
      roomId: 'room-2',
      actorClientId: expect.any(String),
      shutdownPin: 'test-pin',
    })
  })

  it('paginates forward when a full page is loaded', async () => {
    const firstPage = Array.from({ length: 25 }, (_, index) => ({
      roomId: `room-${index}`,
      roomName: `room-${index}`,
      participantCount: 1,
      currentClientRole: null,
      isCurrentClientOwner: false,
      updatedAt: new Date().toISOString(),
    }))

    vi.mocked(listRooms)
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce([
        {
          roomId: 'room-26',
          roomName: 'room-26',
          participantCount: 1,
          currentClientRole: null,
          isCurrentClientOwner: false,
          updatedAt: new Date().toISOString(),
        },
      ])

    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/rooms']}>
        <Routes>
          <Route path="/rooms" element={<RoomsPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('room-0')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByText('room-26')).toBeInTheDocument()
    expect(vi.mocked(listRooms)).toHaveBeenLastCalledWith(
      expect.objectContaining({
        pageOffset: 25,
        pageSize: 25,
      })
    )
  })
})
