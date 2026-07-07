import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RoomPage } from '../../src/routes/RoomPage'
import {
  createOrGetRoom,
  joinRoom,
  setRoomFunLevel,
  setRoomTheme,
} from '../../src/features/room/data/roomApi'
import { useRoomLiveState } from '../../src/features/room/realtime/useRoomLiveState'
import { useRoomSettingsLiveState } from '../../src/features/room/realtime/useRoomSettingsLiveState'
import { ThemeProvider } from '../../src/features/theme/context'

vi.mock('../../src/features/room/data/roomApi', () => ({
  createOrGetRoom: vi.fn(),
  joinRoom: vi.fn(),
  kickParticipant: vi.fn(),
  leaveRoom: vi.fn(),
  resetRound: vi.fn(),
  revealRound: vi.fn(),
  setRoomFunLevel: vi.fn(),
  setRoomTheme: vi.fn(),
  setParticipantRole: vi.fn(),
  shutdownRoom: vi.fn(),
  startRevealCountdown: vi.fn(),
  submitVote: vi.fn(),
  triggerHypnotoadEasterEgg: vi.fn(),
}))

vi.mock('../../src/features/room/realtime/useRoomFunEvents', () => ({
  useRoomFunEvents: vi.fn(() => ({
    incomingFunEvent: null,
    sendFunEvent: vi.fn(),
  })),
}))

vi.mock('../../src/features/room/realtime/useRoomLiveState', () => ({
  useRoomLiveState: vi.fn(),
}))

vi.mock('../../src/features/room/realtime/useRoomSettingsLiveState', () => ({
  useRoomSettingsLiveState: vi.fn(),
}))

vi.mock('../../src/features/room/realtime/useVotingLiveState', () => ({
  useVotingLiveState: vi.fn(() => ({
    activeRound: {
      id: 'round-1',
      roomId: 'room-1',
      roundNumber: 1,
      status: 'voting',
      countdownStartedAt: null,
      countdownSeconds: 3,
      revealedAt: null,
      reactionKind: null,
    },
    votes: [],
    errorMessage: null,
  })),
}))

describe('RoomPage controls', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    window.localStorage.setItem(
      'pep.identity.v1',
      JSON.stringify({
        clientId: 'client-1',
        displayName: 'Amy',
        avatarKey: 'bender',
      })
    )
    window.sessionStorage.setItem('pep.active-room.v1', 'demo-room')

    vi.mocked(createOrGetRoom).mockResolvedValue({
      id: 'room-1',
      name: 'demo-room',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    vi.mocked(useRoomSettingsLiveState).mockReturnValue({
      roomSettings: {
        roomId: 'room-1',
        deckType: 'fibonacci',
        autoRevealEnabled: true,
        revealCountdownEnabled: true,
        revealCountdownSeconds: 3,
        funLevel: 'chaotic',
        themeId: 'futurama',
        updatedAt: new Date().toISOString(),
      },
      errorMessage: null,
    })
    vi.mocked(setRoomFunLevel).mockResolvedValue({
      result_room_id: 'room-1',
      result_fun_level: 'disabled',
      result_updated_at: new Date().toISOString(),
    })
  })

  it('disables the effects toggle for non-owners and removes room shutdown from the room page', async () => {
    vi.mocked(joinRoom).mockResolvedValue({
      participantId: 'participant-2',
      roomId: 'room-1',
      roomName: 'demo-room',
      displayName: 'Amy',
      avatarKey: 'bender',
      role: 'voter',
      isKicked: false,
    })
    vi.mocked(useRoomLiveState).mockReturnValue({
      participants: [
        {
          id: 'participant-1',
          roomId: 'room-1',
          displayName: 'Owner',
          avatarKey: 'fry',
          role: 'voter',
          isKicked: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'participant-2',
          roomId: 'room-1',
          displayName: 'Amy',
          avatarKey: 'bender',
          role: 'voter',
          isKicked: false,
          createdAt: new Date().toISOString(),
        },
      ],
      presenceByParticipantId: {},
      errorMessage: null,
    })

    renderRoomPage()

    const effectsButton = await screen.findByRole('button', {
      name: 'Effects: on',
    })

    expect(effectsButton).toBeDisabled()
    expect(
      screen.getByText(/Only the room owner can change this\./)
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Close room' })
    ).not.toBeInTheDocument()
  })

  it('allows the owner to toggle effects', async () => {
    vi.mocked(joinRoom).mockResolvedValue({
      participantId: 'participant-1',
      roomId: 'room-1',
      roomName: 'demo-room',
      displayName: 'Amy',
      avatarKey: 'bender',
      role: 'voter',
      isKicked: false,
    })
    vi.mocked(useRoomLiveState).mockReturnValue({
      participants: [
        {
          id: 'participant-1',
          roomId: 'room-1',
          displayName: 'Amy',
          avatarKey: 'bender',
          role: 'voter',
          isKicked: false,
          createdAt: new Date().toISOString(),
        },
      ],
      presenceByParticipantId: {},
      errorMessage: null,
    })

    const user = userEvent.setup()

    renderRoomPage()

    await user.click(
      await screen.findByRole('button', {
        name: 'Effects: on',
      })
    )

    await waitFor(() =>
      expect(vi.mocked(setRoomFunLevel)).toHaveBeenCalledWith({
        roomId: 'room-1',
        actorClientId: 'client-1',
        nextFunLevel: 'disabled',
      })
    )
  })

  it('does not apply createTheme to an existing single-owner room', async () => {
    vi.mocked(createOrGetRoom).mockResolvedValue({
      id: 'room-1',
      name: 'demo-room',
      createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
      updatedAt: new Date().toISOString(),
    })
    vi.mocked(joinRoom).mockResolvedValue({
      participantId: 'participant-1',
      roomId: 'room-1',
      roomName: 'demo-room',
      displayName: 'Amy',
      avatarKey: 'bender',
      role: 'voter',
      isKicked: false,
    })
    vi.mocked(useRoomLiveState).mockReturnValue({
      participants: [
        {
          id: 'participant-1',
          roomId: 'room-1',
          displayName: 'Amy',
          avatarKey: 'bender',
          role: 'voter',
          isKicked: false,
          createdAt: new Date().toISOString(),
        },
      ],
      presenceByParticipantId: {},
      errorMessage: null,
    })

    renderRoomPage('/rooms/demo-room?createTheme=zootopia')

    await screen.findByLabelText('Room theme')
    await new Promise((resolve) => window.setTimeout(resolve, 0))

    expect(vi.mocked(setRoomTheme)).not.toHaveBeenCalled()
  })
})

function renderRoomPage(initialEntry = '/rooms/demo-room') {
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/rooms/:roomName" element={<RoomPage />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  )
}
