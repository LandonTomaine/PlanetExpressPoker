import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { avatarOptions } from '../features/identity/avatars'
import { createClientId } from '../features/identity/storage'
import {
  createOrGetRoom,
  getActiveRound,
  joinRoom,
  listVotes,
  resetRound,
  revealRound,
  startRevealCountdown,
  submitVote,
} from '../features/room/data/roomApi'
import type { JoinedParticipant, Room, Round } from '../features/room/types'
import {
  fibonacciDeck,
  getCardDisplayLabel,
  getCardMeaningLabel,
} from '../features/room/voting'

type DevParticipant = {
  avatarKey: string
  clientId: string
  displayName: string
  joinedParticipant: JoinedParticipant | null
}

const defaultDevParticipantCount = 4

function getStorageKey(roomName: string) {
  return `pep.dev-multiplayer.v1:${roomName}`
}

function createDevParticipants(roomName: string) {
  const roomSuffix = Math.abs(hashString(roomName)).toString(36).slice(0, 4)
  const runSuffix = Date.now().toString(36).slice(-4)
  const suffix = `${roomSuffix}-${runSuffix}`

  return Array.from({ length: defaultDevParticipantCount }, (_, index) => {
    const avatar = avatarOptions[index % avatarOptions.length]

    return {
      avatarKey: avatar.key,
      clientId: createClientId(),
      displayName: `Dev ${index + 1}-${suffix}`,
      joinedParticipant: null,
    } satisfies DevParticipant
  })
}

function readDevParticipants(roomName: string) {
  try {
    const rawValue = window.sessionStorage.getItem(getStorageKey(roomName))

    if (!rawValue) {
      return createDevParticipants(roomName)
    }

    const parsedValue = JSON.parse(rawValue) as DevParticipant[]

    if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
      return createDevParticipants(roomName)
    }

    return parsedValue.map((participant, index) => {
      const fallbackAvatar = avatarOptions[index % avatarOptions.length]

      return {
        avatarKey:
          typeof participant.avatarKey === 'string' && participant.avatarKey
            ? participant.avatarKey
            : fallbackAvatar.key,
        clientId:
          typeof participant.clientId === 'string' && participant.clientId
            ? participant.clientId
            : createClientId(),
        displayName:
          typeof participant.displayName === 'string' && participant.displayName
            ? participant.displayName
            : `Dev ${index + 1}`,
        joinedParticipant: participant.joinedParticipant ?? null,
      }
    })
  } catch {
    return createDevParticipants(roomName)
  }
}

function saveDevParticipants(roomName: string, participants: DevParticipant[]) {
  window.sessionStorage.setItem(
    getStorageKey(roomName),
    JSON.stringify(participants)
  )
}

export function DevMultiplayerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialRoomName = searchParams.get('room') ?? ''
  const [roomName, setRoomName] = useState(initialRoomName)
  const [loadedRoomName, setLoadedRoomName] = useState('')
  const [room, setRoom] = useState<Room | null>(null)
  const [activeRound, setActiveRound] = useState<Round | null>(null)
  const [participants, setParticipants] = useState<DevParticipant[]>([])
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({})
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const hasAutoLoadedRef = useRef(false)

  const joinedParticipants = participants.filter(
    (participant) => participant.joinedParticipant
  )
  const actorParticipant = joinedParticipants[0] ?? null
  const canUseRoundControls = Boolean(room && activeRound && actorParticipant)

  useEffect(() => {
    if (!loadedRoomName || participants.length === 0) {
      return
    }

    saveDevParticipants(loadedRoomName, participants)
  }, [loadedRoomName, participants])

  async function refreshRoomState(
    nextRoom = room,
    nextParticipants = participants
  ) {
    if (!nextRoom) {
      return
    }

    const nextRound = await getActiveRound(nextRoom.id)
    const nextSelectedVotes: Record<string, string> = {}

    await Promise.all(
      nextParticipants.map(async (participant) => {
        if (!participant.joinedParticipant) {
          return
        }

        const votes = await listVotes({
          roundId: nextRound.id,
          actorClientId: participant.clientId,
        })
        const ownVote = votes.find(
          (vote) =>
            vote.participantId === participant.joinedParticipant?.participantId
        )

        if (ownVote && ownVote.cardValue !== '__hidden__') {
          nextSelectedVotes[participant.clientId] = ownVote.cardValue
        }
      })
    )

    setActiveRound(nextRound)
    setSelectedVotes(nextSelectedVotes)
  }

  async function loadRoom() {
    const normalizedRoomName = roomName.trim()

    if (!normalizedRoomName) {
      setErrorMessage('Enter a room name.')
      return
    }

    setIsBusy(true)
    setErrorMessage(null)
    setStatusMessage(null)

    try {
      const nextRoom = await createOrGetRoom(normalizedRoomName)
      const nextParticipants = readDevParticipants(normalizedRoomName)

      setLoadedRoomName(normalizedRoomName)
      setRoomName(normalizedRoomName)
      setRoom(nextRoom)
      setParticipants(nextParticipants)
      setSearchParams({ room: normalizedRoomName })
      await refreshRoomState(nextRoom, nextParticipants)
      setStatusMessage(`Loaded ${normalizedRoomName}.`)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load room.'
      )
    } finally {
      setIsBusy(false)
    }
  }

  const loadRoomEvent = useEffectEvent(async () => {
    await loadRoom()
  })

  useEffect(() => {
    if (hasAutoLoadedRef.current || !initialRoomName) {
      return
    }

    hasAutoLoadedRef.current = true
    void loadRoomEvent()
  }, [initialRoomName])

  async function joinAll() {
    if (!room || !loadedRoomName) {
      return
    }

    setIsBusy(true)
    setErrorMessage(null)
    setStatusMessage(null)

    try {
      const nextParticipants = await Promise.all(
        participants.map(async (participant) => {
          const joinedParticipant = await joinRoom({
            roomName: loadedRoomName,
            clientId: participant.clientId,
            displayName: participant.displayName,
            avatarKey: participant.avatarKey,
          })

          return {
            ...participant,
            joinedParticipant,
          }
        })
      )

      setParticipants(nextParticipants)
      await refreshRoomState(room, nextParticipants)
      setStatusMessage('Dev participants joined.')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to join participants.'
      )
    } finally {
      setIsBusy(false)
    }
  }

  async function voteAs(participant: DevParticipant, cardValue: string) {
    if (!room || !participant.joinedParticipant) {
      return
    }

    setErrorMessage(null)

    try {
      await submitVote({
        roomId: room.id,
        clientId: participant.clientId,
        cardValue,
      })
      setSelectedVotes((currentVotes) => ({
        ...currentVotes,
        [participant.clientId]: cardValue,
      }))
      await refreshRoomState()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to submit vote.'
      )
    }
  }

  async function reveal() {
    if (!room || !actorParticipant) {
      return
    }

    setIsBusy(true)
    setErrorMessage(null)

    try {
      await revealRound({
        roomId: room.id,
        actorClientId: actorParticipant.clientId,
      })
      await refreshRoomState()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to reveal votes.'
      )
    } finally {
      setIsBusy(false)
    }
  }

  async function countdown() {
    if (!room || !actorParticipant) {
      return
    }

    setIsBusy(true)
    setErrorMessage(null)

    try {
      await startRevealCountdown({
        roomId: room.id,
        actorClientId: actorParticipant.clientId,
      })
      await refreshRoomState()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to start countdown.'
      )
    } finally {
      setIsBusy(false)
    }
  }

  async function nextRound() {
    if (!room || !actorParticipant) {
      return
    }

    setIsBusy(true)
    setErrorMessage(null)

    try {
      await resetRound({
        roomId: room.id,
        actorClientId: actorParticipant.clientId,
      })
      setSelectedVotes({})
      await refreshRoomState()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to reset round.'
      )
    } finally {
      setIsBusy(false)
    }
  }

  function resetLocalParticipants() {
    if (!loadedRoomName) {
      return
    }

    const nextParticipants = createDevParticipants(loadedRoomName)

    setParticipants(nextParticipants)
    setSelectedVotes({})
    saveDevParticipants(loadedRoomName, nextParticipants)
    setStatusMessage('Reset local dev participant identities.')
  }

  return (
    <section className="space-y-4">
      <div className="rounded-[16px] border border-[var(--pep-line)] bg-white/90 p-5 shadow-[0_14px_38px_rgba(12,32,42,0.08)]">
        <p className="text-xs font-black uppercase text-[var(--pep-accent)]">
          Local dev only
        </p>
        <h2 className="mt-2 font-[var(--pep-font-display)] text-4xl leading-none text-[var(--pep-ink)]">
          Multiplayer simulator
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--pep-ink-soft)]">
          Spawn synthetic participants in the same room and submit votes as each
          one without opening separate browsers.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            value={roomName}
            onChange={(event) => setRoomName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void loadRoom()
              }
            }}
            placeholder="room-name"
            className="rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--pep-accent-2)]"
          />
          <button
            type="button"
            onClick={() => void loadRoom()}
            disabled={isBusy}
            className="rounded-[10px] bg-[var(--pep-accent)] px-4 py-3 text-sm font-black uppercase text-white shadow-[0_10px_24px_rgba(212,47,38,0.22)] transition hover:-translate-y-0.5 disabled:cursor-default disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
          >
            Load room
          </button>
          {loadedRoomName ? (
            <Link
              to={`/rooms/${encodeURIComponent(loadedRoomName)}`}
              className="rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-4 py-3 text-center text-sm font-black uppercase text-[var(--pep-ink)] transition hover:-translate-y-0.5"
            >
              Open room
            </Link>
          ) : null}
        </div>

        {statusMessage ? (
          <p className="mt-3 rounded-[12px] border border-[var(--pep-accent-2)]/25 bg-[var(--pep-accent-2)]/10 px-4 py-3 text-sm font-semibold text-[var(--pep-ink)]">
            {statusMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mt-3 rounded-[12px] border border-[var(--pep-accent)]/25 bg-[var(--pep-accent)]/10 px-4 py-3 text-sm font-semibold text-[var(--pep-accent)]">
            {errorMessage}
          </p>
        ) : null}
      </div>

      {room ? (
        <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
          <aside className="rounded-[16px] border border-[var(--pep-line)] bg-white/86 p-4 shadow-[0_14px_38px_rgba(12,32,42,0.08)]">
            <p className="text-xs font-black uppercase text-[var(--pep-accent)]">
              Controls
            </p>
            <h3 className="mt-2 font-[var(--pep-font-display)] text-2xl text-[var(--pep-ink)]">
              {loadedRoomName}
            </h3>
            <p className="mt-2 text-sm text-[var(--pep-ink-soft)]">
              Round {activeRound?.roundNumber ?? '-'} -{' '}
              {activeRound?.status ?? 'loading'}
            </p>

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => void joinAll()}
                disabled={isBusy || participants.length === 0}
                className="rounded-[10px] bg-[var(--pep-accent-2)] px-4 py-3 text-sm font-black uppercase text-white shadow-[0_10px_24px_rgba(31,160,137,0.18)] transition hover:-translate-y-0.5 disabled:cursor-default disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
              >
                Join all
              </button>
              <button
                type="button"
                onClick={() => void countdown()}
                disabled={isBusy || !canUseRoundControls}
                className="rounded-[10px] border border-[var(--pep-line-strong)] bg-[var(--pep-yellow)] px-4 py-3 text-sm font-black uppercase text-[var(--pep-ink)] transition hover:-translate-y-0.5 disabled:cursor-default disabled:bg-slate-100 disabled:text-slate-400"
              >
                Countdown
              </button>
              <button
                type="button"
                onClick={() => void reveal()}
                disabled={isBusy || !canUseRoundControls}
                className="rounded-[10px] border border-[var(--pep-line-strong)] bg-[var(--pep-accent)] px-4 py-3 text-sm font-black uppercase text-white transition hover:-translate-y-0.5 disabled:cursor-default disabled:bg-slate-100 disabled:text-slate-400"
              >
                Reveal
              </button>
              <button
                type="button"
                onClick={() => void nextRound()}
                disabled={isBusy || !canUseRoundControls}
                className="rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-4 py-3 text-sm font-black uppercase text-[var(--pep-ink)] transition hover:-translate-y-0.5 disabled:cursor-default disabled:bg-slate-100 disabled:text-slate-400"
              >
                Next round
              </button>
              <button
                type="button"
                onClick={resetLocalParticipants}
                disabled={isBusy || !loadedRoomName}
                className="rounded-[10px] border border-[var(--pep-line)] bg-white/70 px-4 py-3 text-sm font-black uppercase text-[var(--pep-ink-soft)] transition hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-50"
              >
                Reset local dev users
              </button>
            </div>
          </aside>

          <div className="grid gap-4">
            {participants.map((participant) => {
              const avatar =
                avatarOptions.find(
                  (avatarOption) => avatarOption.key === participant.avatarKey
                ) ?? avatarOptions[0]
              const selectedVote = selectedVotes[participant.clientId]

              return (
                <article
                  key={participant.clientId}
                  className="rounded-[16px] border border-[var(--pep-line)] bg-white/88 p-4 shadow-[0_14px_38px_rgba(12,32,42,0.08)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`grid h-12 w-12 overflow-hidden rounded-[12px] bg-gradient-to-br ${avatar.accentClassName}`}
                      >
                        <img
                          src={avatar.portraitPath}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <div>
                        <h4 className="font-[var(--pep-font-display)] text-2xl leading-none text-[var(--pep-ink)]">
                          {participant.displayName}
                        </h4>
                        <p className="mt-1 text-xs font-black uppercase text-[var(--pep-ink-soft)]">
                          {participant.joinedParticipant
                            ? 'Joined'
                            : 'Not joined'}
                          {selectedVote ? ` - voted ${selectedVote}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {fibonacciDeck.map((cardValue) => {
                      const isSelected = selectedVote === cardValue
                      const meaningLabel = getCardMeaningLabel(cardValue)

                      return (
                        <button
                          key={cardValue}
                          type="button"
                          onClick={() => void voteAs(participant, cardValue)}
                          disabled={
                            isBusy ||
                            !participant.joinedParticipant ||
                            activeRound?.status === 'revealed'
                          }
                          className={[
                            'min-h-14 min-w-14 rounded-[12px] border-2 px-3 py-2 text-sm font-black transition',
                            isSelected
                              ? 'cursor-pointer border-[var(--pep-ink)] bg-[var(--pep-yellow)] text-[var(--pep-ink)] shadow-[0_7px_0_rgba(20,38,51,0.18)]'
                              : 'cursor-pointer border-[var(--pep-line-strong)] bg-white text-[var(--pep-ink)] hover:-translate-y-0.5',
                            isBusy ||
                            !participant.joinedParticipant ||
                            activeRound?.status === 'revealed'
                              ? 'cursor-default border-slate-300 bg-slate-100 text-slate-400 shadow-none hover:translate-y-0'
                              : '',
                          ].join(' ')}
                        >
                          <span className="block">
                            {meaningLabel ?? getCardDisplayLabel(cardValue)}
                          </span>
                          {meaningLabel ? (
                            <span className="mt-1 block text-[0.65rem] uppercase opacity-70">
                              {getCardDisplayLabel(cardValue)}
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function hashString(value: string) {
  return value.split('').reduce((hash, character) => {
    return (hash << 5) - hash + character.charCodeAt(0)
  }, 0)
}
