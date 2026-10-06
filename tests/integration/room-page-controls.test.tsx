import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RoomPage } from '../../src/routes/RoomPage'
import {
  createOrGetRoom,
  joinRoom,
  revealRound,
  setRoomFunLevel,
  setRoomTheme,
  startRevealCountdown,
  submitVote,
} from '../../src/features/room/data/roomApi'
import { useRoomLiveState } from '../../src/features/room/realtime/useRoomLiveState'
import { useRoomSettingsLiveState } from '../../src/features/room/realtime/useRoomSettingsLiveState'
import { useVotingLiveState } from '../../src/features/room/realtime/useVotingLiveState'
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

  it('explains score calculations and separates voters from spectators', async () => {
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
        {
          id: 'participant-3',
          roomId: 'room-1',
          displayName: 'Leela',
          avatarKey: 'leela',
          role: 'spectator',
          isKicked: false,
          createdAt: new Date().toISOString(),
        },
      ],
      presenceByParticipantId: {
        'participant-1': {
          participantId: 'participant-1',
          displayName: 'Owner',
          avatarKey: 'fry',
          role: 'voter',
          onlineAt: new Date().toISOString(),
        },
      },
      errorMessage: null,
    })
    vi.mocked(useVotingLiveState).mockReturnValue({
      activeRound: {
        id: 'round-1',
        roomId: 'room-1',
        roundNumber: 1,
        status: 'revealed',
        countdownStartedAt: null,
        countdownSeconds: 3,
        revealedAt: new Date().toISOString(),
        reactionKind: null,
      },
      votes: [
        {
          roundId: 'round-1',
          participantId: 'participant-1',
          cardValue: '3',
          isUnsure: false,
          submittedAt: new Date().toISOString(),
        },
        {
          roundId: 'round-1',
          participantId: 'participant-2',
          cardValue: '5',
          isUnsure: true,
          submittedAt: new Date().toISOString(),
        },
      ],
      errorMessage: null,
    })

    renderRoomPage()

    expect(
      await screen.findByText('Numeric votes: 3 (regular) + 5 (unsure × 75%).')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Weighted total: 6.75 ÷ 1.75 vote weight = 3.86; rounded up to 5.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Unsure numeric votes count at 75% for the average. Special cards are excluded.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Suggested card')).toBeInTheDocument()
    expect(
      screen.getByText('Middle votes: 3 and 5. Uses the lower middle card: 3.')
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Voters' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Spectators' })
    ).toBeInTheDocument()
    expect(screen.getByText('Watching this round')).toBeInTheDocument()
    expect(screen.getByText('online now')).toBeInTheDocument()
    expect(screen.getAllByText('offline')).toHaveLength(2)
    expect(
      document.querySelector('span[aria-label="Unsure estimate"]')
    ).toBeInTheDocument()
  })

  it('defaults estimates to regular and submits an unsure marker when toggled', async () => {
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
    vi.mocked(useVotingLiveState).mockReturnValue({
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
    })

    const user = userEvent.setup()
    renderRoomPage()

    await user.click(await screen.findByRole('button', { name: '3 card' }))
    await waitFor(() =>
      expect(vi.mocked(submitVote)).toHaveBeenLastCalledWith({
        roomId: 'room-1',
        clientId: 'client-1',
        cardValue: '3',
        isUnsure: false,
      })
    )
    expect(
      screen.getByRole('button', { name: 'Unsure estimate' })
    ).toHaveAttribute('aria-pressed', 'false')

    await user.click(screen.getByRole('button', { name: 'Unsure estimate' }))
    await waitFor(() =>
      expect(vi.mocked(submitVote)).toHaveBeenLastCalledWith({
        roomId: 'room-1',
        clientId: 'client-1',
        cardValue: '3',
        isUnsure: true,
      })
    )

    await user.click(screen.getByRole('button', { name: '5 card' }))
    await waitFor(() =>
      expect(vi.mocked(submitVote)).toHaveBeenLastCalledWith({
        roomId: 'room-1',
        clientId: 'client-1',
        cardValue: '5',
        isUnsure: true,
      })
    )
  })

  it('confirms before revealing when a voter has not submitted a vote', async () => {
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
        {
          id: 'participant-2',
          roomId: 'room-1',
          displayName: 'Leela',
          avatarKey: 'leela',
          role: 'voter',
          isKicked: false,
          createdAt: new Date().toISOString(),
        },
      ],
      presenceByParticipantId: {},
      errorMessage: null,
    })
    vi.mocked(useVotingLiveState).mockReturnValue({
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
      votes: [
        {
          roundId: 'round-1',
          participantId: 'participant-1',
          cardValue: '3',
          isUnsure: false,
          submittedAt: new Date().toISOString(),
        },
      ],
      errorMessage: null,
    })
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()

    renderRoomPage()

    await user.click(await screen.findByRole('button', { name: 'Reveal' }))

    expect(confirmSpy).toHaveBeenCalledWith(
      '1 voter has not voted yet. Reveal anyway?'
    )
    expect(vi.mocked(revealRound)).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Countdown' }))

    expect(confirmSpy).toHaveBeenCalledTimes(2)
    expect(vi.mocked(startRevealCountdown)).not.toHaveBeenCalled()

    confirmSpy.mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'Reveal' }))

    await waitFor(() =>
      expect(vi.mocked(revealRound)).toHaveBeenCalledWith({
        roomId: 'room-1',
        actorClientId: 'client-1',
      })
    )
  })

  it('counts the revealer’s optimistic vote while live vote state is catching up', async () => {
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
        {
          id: 'participant-2',
          roomId: 'room-1',
          displayName: 'Leela',
          avatarKey: 'leela',
          role: 'voter',
          isKicked: false,
          createdAt: new Date().toISOString(),
        },
      ],
      presenceByParticipantId: {},
      errorMessage: null,
    })
    vi.mocked(useVotingLiveState).mockReturnValue({
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
      votes: [
        {
          roundId: 'round-1',
          participantId: 'participant-2',
          cardValue: '3',
          isUnsure: false,
          submittedAt: new Date().toISOString(),
        },
      ],
      errorMessage: null,
    })
    const confirmSpy = vi.spyOn(window, 'confirm')
    const user = userEvent.setup()

    renderRoomPage()

    await user.click(await screen.findByRole('button', { name: /5 card/i }))
    await user.click(screen.getByRole('button', { name: 'Reveal' }))

    expect(vi.mocked(submitVote)).toHaveBeenCalled()
    expect(confirmSpy).not.toHaveBeenCalled()
    await waitFor(() => expect(vi.mocked(revealRound)).toHaveBeenCalled())
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
