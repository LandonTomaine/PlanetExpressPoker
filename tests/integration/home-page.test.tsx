import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HomePage } from '../../src/routes/HomePage'
import {
  listClientRooms,
  leaveRoom,
  shutdownRoom,
} from '../../src/features/room/data/roomApi'

vi.mock('../../src/features/room/data/roomApi', () => ({
  leaveRoom: vi.fn(),
  listClientRooms: vi.fn(),
  shutdownRoom: vi.fn(),
}))

vi.mock('../../src/features/room/realtime/useRoomPresenceCounts', () => ({
  useRoomPresenceCounts: vi.fn(() => ({})),
}))

beforeEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
  vi.clearAllMocks()
  vi.mocked(listClientRooms).mockResolvedValue([])
  vi.mocked(leaveRoom).mockResolvedValue({ result_participant_id: 'left-room' })
  vi.mocked(shutdownRoom).mockResolvedValue({ result_room_id: 'closed-room' })
})

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
    await user.click(screen.getByRole('button', { name: 'Join as voter' }))

    expect(screen.getByText('Opened demo-room')).toBeInTheDocument()
    expect(window.sessionStorage.getItem('pep.active-room.v1')).toBe(
      'demo-room'
    )
    expect(window.sessionStorage.getItem('pep.room-name-prefill.v1')).toBe(
      'demo-room'
    )
    expect(window.localStorage.getItem('pep.identity.v1')).toContain(
      '"displayName":"Amy"'
    )
    expect(window.localStorage.getItem('pep.identity.v1')).toContain(
      '"avatarKey":"bender"'
    )
    expect(screen.getByText(/^Search\s*$/)).toBeInTheDocument()
  })

  it('opens the room as spectator when selected on the home page', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms/:roomName" element={<OpenedRoom />} />
        </Routes>
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Room name'), 'demo-room')
    await user.type(screen.getByLabelText('Your name'), 'Amy')
    await user.click(screen.getByRole('button', { name: 'Spectator' }))
    await user.click(screen.getByRole('button', { name: 'Join as spectator' }))

    expect(screen.getByText('Opened demo-room')).toBeInTheDocument()
    expect(screen.getByText('Search ?joinAs=spectator')).toBeInTheDocument()
  })

  it('prefills the room name from the saved redirect value', () => {
    window.sessionStorage.setItem('pep.room-name-prefill.v1', 'redirect-room')

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByLabelText('Room name')).toHaveValue('redirect-room')
  })

  it('renders current browser rooms from the backend summary', async () => {
    vi.mocked(listClientRooms).mockResolvedValue([
      {
        roomId: 'room-1',
        roomName: 'delivery-deck',
        participantCount: 3,
        currentClientRole: 'spectator',
        isCurrentClientOwner: false,
        updatedAt: new Date().toISOString(),
      },
    ])

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('delivery-deck')).toBeInTheDocument()
    expect(screen.getByText('spectator')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Leave room' })
    ).toBeInTheDocument()
  })
})

function OpenedRoom() {
  const { roomName } = useParams()
  const location = useLocation()

  return (
    <>
      <div>Opened {roomName}</div>
      <div>Search {location.search}</div>
    </>
  )
}
