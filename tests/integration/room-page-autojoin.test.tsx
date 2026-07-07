import { render, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RoomPage } from '../../src/routes/RoomPage'
import { createOrGetRoom, joinRoom } from '../../src/features/room/data/roomApi'
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
  useRoomLiveState: vi.fn(() => ({
    participants: [],
    presenceByParticipantId: {},
    errorMessage: null,
  })),
}))

vi.mock('../../src/features/room/realtime/useRoomSettingsLiveState', () => ({
  useRoomSettingsLiveState: vi.fn(() => ({
    roomSettings: null,
    errorMessage: null,
  })),
}))

vi.mock('../../src/features/room/realtime/useVotingLiveState', () => ({
  useVotingLiveState: vi.fn(() => ({
    activeRound: null,
    votes: [],
    errorMessage: null,
  })),
}))

describe('RoomPage auto-join', () => {
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
    vi.mocked(joinRoom).mockResolvedValue({
      participantId: 'participant-1',
      roomId: 'room-1',
      roomName: 'demo-room',
      displayName: 'Amy',
      avatarKey: 'bender',
      role: 'spectator',
      isKicked: false,
    })
  })

  it('preserves an explicit spectator request during silent auto-join', async () => {
    renderRoomPage('/rooms/demo-room?joinAs=spectator')

    await waitFor(() =>
      expect(vi.mocked(joinRoom)).toHaveBeenCalledWith(
        expect.objectContaining({
          roomName: 'demo-room',
          clientId: 'client-1',
          displayName: 'Amy',
          avatarKey: 'bender',
          role: 'spectator',
        })
      )
    )
  })

  it('leaves silent auto-join role unset when no spectator request is present', async () => {
    renderRoomPage('/rooms/demo-room')

    await waitFor(() =>
      expect(vi.mocked(joinRoom)).toHaveBeenCalledWith(
        expect.objectContaining({
          roomName: 'demo-room',
          clientId: 'client-1',
          displayName: 'Amy',
          avatarKey: 'bender',
          role: null,
        })
      )
    )
  })
})

function renderRoomPage(initialEntry: string) {
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
