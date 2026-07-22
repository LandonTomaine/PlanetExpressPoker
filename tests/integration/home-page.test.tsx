import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
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
} from '../../src/features/room/data/roomApi'
import { ThemeProvider } from '../../src/features/theme/context'

vi.mock('../../src/features/room/data/roomApi', () => ({
  leaveRoom: vi.fn(),
  listClientRooms: vi.fn(),
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
})

describe('HomePage', () => {
  it('creates or joins a room after name, room, and avatar selection', async () => {
    const user = userEvent.setup()

    renderWithTheme(
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

    expect(screen.getByText(/Opened/)).toBeInTheDocument()
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
    expect(screen.getByText('Search ?createTheme=futurama')).toBeInTheDocument()
  })

  it('opens the room as spectator when selected on the home page', async () => {
    const user = userEvent.setup()

    renderWithTheme(
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

    expect(screen.getByText(/Opened/)).toBeInTheDocument()
    expect(
      screen.getByText('Search ?joinAs=spectator&createTheme=futurama')
    ).toBeInTheDocument()
  })

  it('keeps the page theme separate from the new room theme', async () => {
    const user = userEvent.setup()

    renderWithTheme(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms/:roomName" element={<OpenedRoom />} />
        </Routes>
      </MemoryRouter>
    )

    await user.selectOptions(screen.getByLabelText('Page theme'), 'toy-story')
    await user.selectOptions(
      screen.getByLabelText('New room theme'),
      'zootopia'
    )
    await user.type(screen.getByLabelText('Room name'), 'separate-themes')
    await user.type(screen.getByLabelText('Your name'), 'Andy')
    await user.click(screen.getByRole('button', { name: 'Join as voter' }))

    expect(screen.getByText('Search ?createTheme=zootopia')).toBeInTheDocument()
    expect(window.localStorage.getItem('pep.theme.v1')).toBe('toy-story')
  })

  it('shows a clear error when the room name contains spaces', async () => {
    const user = userEvent.setup()

    renderWithTheme(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    )

    const roomNameInput = screen.getByLabelText('Room name')

    await user.type(roomNameInput, 'planet express')
    await user.type(screen.getByLabelText('Your name'), 'Amy')

    expect(roomNameInput).toHaveAttribute('aria-invalid', 'true')
    expect(
      screen.getByText(
        'Room names cannot include spaces. Use hyphens or underscores instead.'
      )
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Join as voter' })).toBeDisabled()
  })

  it('prefills the room name from the saved redirect value', () => {
    window.sessionStorage.setItem('pep.room-name-prefill.v1', 'redirect-room')

    renderWithTheme(
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
        themeId: 'futurama',
        participantCount: 3,
        currentClientRole: 'spectator',
        isCurrentClientOwner: false,
        updatedAt: new Date().toISOString(),
      },
    ])

    renderWithTheme(
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

  it('does not show the empty rooms state when rooms fail to load', async () => {
    vi.mocked(listClientRooms).mockRejectedValue(
      new TypeError('Failed to fetch')
    )

    renderWithTheme(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(
      await screen.findByText(
        'Failed to reach the room service. Check your connection and refresh.'
      )
    ).toBeInTheDocument()
    expect(
      screen.queryByText(
        'You are not currently part of any rooms on this browser.'
      )
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
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

function renderWithTheme(children: ReactNode) {
  return render(<ThemeProvider>{children}</ThemeProvider>)
}
