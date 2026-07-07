import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  getAvatarOptions,
  getAvatarPortraitClassName,
} from '../features/identity/avatars'
import {
  maxDisplayNameLength,
  normalizeDisplayName,
} from '../features/identity/displayName'
import {
  clearActiveRoomName,
  readActiveRoomName,
  readRoomThemePrefill,
  readRoomNamePrefill,
  readStoredIdentity,
  saveActiveRoomName,
  saveRoomThemePrefill,
  saveRoomNamePrefill,
  saveStoredIdentity,
} from '../features/identity/storage'
import { leaveRoom, listClientRooms } from '../features/room/data/roomApi'
import { useRoomPresenceCounts } from '../features/room/realtime/useRoomPresenceCounts'
import {
  getRoomNameError,
  maxRoomNameLength,
  normalizeRoomName,
  roomNameInputPattern,
} from '../features/room/roomName'
import type { ParticipantRole, RoomSummary } from '../features/room/types'
import { ThemeSelect } from '../features/theme/ThemeSelect'
import { useTheme } from '../features/theme/useTheme'
import { getThemeConfig } from '../features/theme/registry'
import type { ThemeId } from '../features/theme/types'

export function HomePage() {
  const navigate = useNavigate()
  const { activeTheme, personalThemeId, setPersonalThemeId } = useTheme()
  const [roomName, setRoomName] = useState(
    () => readRoomNamePrefill() ?? readActiveRoomName() ?? ''
  )
  const [identity, setIdentity] = useState(() => readStoredIdentity())
  const [roomThemeId, setRoomThemeId] = useState<ThemeId>(
    () => readRoomThemePrefill() ?? personalThemeId
  )
  const [joinRole, setJoinRole] = useState<ParticipantRole>('voter')
  const [myRooms, setMyRooms] = useState<RoomSummary[]>([])
  const [isMyRoomsLoading, setIsMyRoomsLoading] = useState(true)
  const [myRoomsError, setMyRoomsError] = useState<string | null>(null)
  const [pendingRoomActionId, setPendingRoomActionId] = useState<string | null>(
    null
  )
  const roomNameError = getRoomNameError(roomName)
  const hasDisplayName = Boolean(normalizeDisplayName(identity.displayName))
  const canOpenRoom = !roomNameError && hasDisplayName
  const avatarOptions = getAvatarOptions(activeTheme.id)
  const onlineCountByRoomName = useRoomPresenceCounts(
    myRooms.map((roomSummary) => roomSummary.roomName)
  )

  const openRoom = () => {
    const normalizedRoomName = normalizeRoomName(roomName)
    const normalizedDisplayName = normalizeDisplayName(identity.displayName)

    if (roomNameError || !normalizedDisplayName) {
      return
    }

    saveStoredIdentity({
      ...identity,
      displayName: normalizedDisplayName,
    })
    saveActiveRoomName(normalizedRoomName)
    saveRoomNamePrefill(normalizedRoomName)
    saveRoomThemePrefill(roomThemeId)
    navigate({
      pathname: `/rooms/${encodeURIComponent(normalizedRoomName)}`,
      search: new URLSearchParams({
        ...(joinRole === 'spectator' ? { joinAs: 'spectator' } : {}),
        createTheme: roomThemeId,
      }).toString(),
    })
  }

  useEffect(() => {
    let isCancelled = false

    const loadMyRooms = async () => {
      setIsMyRoomsLoading(true)

      try {
        const nextRooms = await listClientRooms(identity.clientId)

        if (!isCancelled) {
          setMyRooms(nextRooms)
          setMyRoomsError(null)
        }
      } catch (error) {
        if (!isCancelled) {
          setMyRoomsError(
            error instanceof Error
              ? error.message
              : 'Failed to load your rooms.'
          )
        }
      } finally {
        if (!isCancelled) {
          setIsMyRoomsLoading(false)
        }
      }
    }

    void loadMyRooms()

    return () => {
      isCancelled = true
    }
  }, [identity.clientId])

  async function refreshMyRooms() {
    setIsMyRoomsLoading(true)

    try {
      const nextRooms = await listClientRooms(identity.clientId)
      setMyRooms(nextRooms)
      setMyRoomsError(null)
    } catch (error) {
      setMyRoomsError(
        error instanceof Error ? error.message : 'Failed to load your rooms.'
      )
    } finally {
      setIsMyRoomsLoading(false)
    }
  }

  function openSavedRoom(summary: RoomSummary) {
    saveActiveRoomName(summary.roomName)
    saveRoomNamePrefill(summary.roomName)
    navigate({
      pathname: `/rooms/${encodeURIComponent(summary.roomName)}`,
      search:
        summary.currentClientRole === 'spectator' ? '?joinAs=spectator' : '',
    })
  }

  async function handleLeaveSavedRoom(summary: RoomSummary) {
    setPendingRoomActionId(summary.roomId)
    setMyRoomsError(null)

    try {
      await leaveRoom({
        roomId: summary.roomId,
        actorClientId: identity.clientId,
      })

      if (readActiveRoomName() === summary.roomName) {
        clearActiveRoomName()
      }

      await refreshMyRooms()
    } catch (error) {
      setMyRoomsError(
        error instanceof Error ? error.message : 'Failed to leave room.'
      )
    } finally {
      setPendingRoomActionId(null)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="grid items-start gap-5 rounded-[16px] border border-[var(--pep-line)] bg-[linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(201,240,232,0.82))] p-5 shadow-[0_16px_42px_rgba(12,32,42,0.1)] lg:grid-cols-[1fr_19rem]"
    >
      <div className="max-w-2xl">
        <p className="text-sm font-black uppercase text-[var(--pep-accent)]">
          {activeTheme.homeEyebrow}
        </p>
        <h2 className="mt-2 font-[var(--pep-font-display)] text-4xl leading-none text-[var(--pep-ink)] sm:text-5xl">
          {activeTheme.appTitle}
        </h2>
        <p className="mt-3 max-w-xl text-base leading-7 text-[var(--pep-ink-soft)]">
          {activeTheme.homeDescription}
        </p>

        <div className="mt-5 max-w-2xl rounded-[14px] border border-[var(--pep-line)] bg-white/88 p-4 shadow-[0_14px_34px_rgba(12,32,42,0.08)]">
          <label
            htmlFor="room-name"
            className="text-xs font-black uppercase text-[var(--pep-accent)]"
          >
            Room name
          </label>
          <p className="mt-1 text-sm text-[var(--pep-ink-soft)]">
            Enter a new or existing room name.
          </p>
          <div className="mt-2 grid gap-3">
            <input
              id="room-name"
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              maxLength={maxRoomNameLength}
              pattern={roomNameInputPattern}
              spellCheck={false}
              autoCapitalize="none"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  openRoom()
                }
              }}
              placeholder="farnsworth-friday"
              className="min-w-0 flex-1 rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--pep-accent-2)]"
            />
            <p className="text-xs font-semibold text-[var(--pep-ink-soft)]">
              {roomNameError
                ? roomNameError
                : `Use letters, numbers, hyphen, or underscore. Max ${maxRoomNameLength} characters.`}
            </p>
            <label className="block">
              <span className="text-xs font-black uppercase text-[var(--pep-accent)]">
                Your name
              </span>
              <input
                value={identity.displayName}
                onChange={(event) =>
                  setIdentity((currentIdentity) => ({
                    ...currentIdentity,
                    displayName: event.target.value.slice(
                      0,
                      maxDisplayNameLength
                    ),
                  }))
                }
                maxLength={maxDisplayNameLength}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    openRoom()
                  }
                }}
                placeholder={activeTheme.displayNamePlaceholder}
                className="mt-2 w-full rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--pep-accent-2)]"
              />
            </label>
            <ThemeSelect
              label="Landing theme"
              value={personalThemeId}
              onChange={(nextThemeId) => setPersonalThemeId(nextThemeId)}
            />
            <ThemeSelect
              label="New room theme"
              value={roomThemeId}
              onChange={(nextThemeId) => {
                setRoomThemeId(nextThemeId)
                saveRoomThemePrefill(nextThemeId)
              }}
            />
            <div>
              <p className="text-xs font-black uppercase text-[var(--pep-accent)]">
                Join as
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  aria-pressed={joinRole === 'voter'}
                  onClick={() => setJoinRole('voter')}
                  className={[
                    'rounded-[10px] border px-4 py-3 text-sm font-black uppercase transition',
                    joinRole === 'voter'
                      ? 'border-[var(--pep-ink)] bg-[linear-gradient(180deg,_#fff6bf,_#f4d44f)] text-[var(--pep-ink)] shadow-[0_8px_18px_rgba(20,38,51,0.14)]'
                      : 'border-[var(--pep-line-strong)] bg-white text-[var(--pep-ink-soft)]',
                  ].join(' ')}
                >
                  Voter
                </button>
                <button
                  type="button"
                  aria-pressed={joinRole === 'spectator'}
                  onClick={() => setJoinRole('spectator')}
                  className={[
                    'rounded-[10px] border px-4 py-3 text-sm font-black uppercase transition',
                    joinRole === 'spectator'
                      ? 'border-[var(--pep-ink)] bg-[linear-gradient(180deg,_#e4f6ef,_#bfe7d8)] text-[var(--pep-ink)] shadow-[0_8px_18px_rgba(20,38,51,0.14)]'
                      : 'border-[var(--pep-line-strong)] bg-white text-[var(--pep-ink-soft)]',
                  ].join(' ')}
                >
                  Spectator
                </button>
              </div>
              <p className="mt-2 text-xs font-semibold text-[var(--pep-ink-soft)]">
                {joinRole === 'spectator'
                  ? 'Spectators can watch the room from the start without voting.'
                  : `Voters can estimate immediately. New rooms start with the ${
                      getThemeConfig(roomThemeId).label
                    } theme.`}
              </p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-[var(--pep-accent)]">
                Avatar
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {avatarOptions.map((avatar) => {
                  const isSelected = avatar.key === identity.avatarKey

                  return (
                    <button
                      key={avatar.key}
                      type="button"
                      aria-label={`Use ${avatar.label} avatar`}
                      title={avatar.label}
                      onClick={() =>
                        setIdentity((currentIdentity) => ({
                          ...currentIdentity,
                          avatarKey: avatar.key,
                        }))
                      }
                      className={[
                        'grid h-11 w-11 place-items-center rounded-[10px] border p-1 transition',
                        isSelected
                          ? 'border-[var(--pep-accent)] bg-white shadow-[0_10px_24px_rgba(212,47,38,0.12)] ring-2 ring-[var(--pep-accent)]/12'
                          : 'border-[var(--pep-line)] bg-white/72 hover:border-[var(--pep-line-strong)]',
                      ].join(' ')}
                    >
                      <span
                        className={`grid h-full w-full overflow-hidden rounded-[8px] bg-gradient-to-br ${avatar.accentClassName}`}
                      >
                        <img
                          src={avatar.portraitPath}
                          alt={avatar.label}
                          className={getAvatarPortraitClassName(avatar)}
                        />
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={openRoom}
              disabled={!canOpenRoom}
              className="rounded-[10px] bg-[var(--pep-accent)] px-5 py-3 text-sm font-black uppercase text-white shadow-[0_10px_24px_rgba(212,47,38,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
            >
              {joinRole === 'spectator' ? 'Join as spectator' : 'Join as voter'}
            </button>
          </div>
          <p className="mt-3 text-sm text-[var(--pep-ink-soft)]">
            Your name and avatar are remembered on this browser. Names are
            limited to {maxDisplayNameLength} characters.
          </p>
        </div>

        <div className="mt-5 max-w-2xl rounded-[14px] border border-[var(--pep-line)] bg-white/88 p-4 shadow-[0_14px_34px_rgba(12,32,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-[var(--pep-accent)]">
                Your rooms
              </p>
              <p className="mt-1 text-sm text-[var(--pep-ink-soft)]">
                Active rooms for this browser identity.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refreshMyRooms()}
              disabled={isMyRoomsLoading}
              className="rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-3 py-2 text-xs font-black uppercase text-[var(--pep-ink)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              Refresh
            </button>
          </div>

          {myRoomsError ? (
            <p className="mt-4 rounded-2xl border border-[var(--pep-accent)]/20 bg-[var(--pep-accent)]/10 px-4 py-3 text-sm font-medium text-[var(--pep-accent)]">
              {myRoomsError}
            </p>
          ) : null}

          {isMyRoomsLoading ? (
            <p className="mt-4 rounded-[12px] border border-[var(--pep-line)] bg-white/70 px-4 py-3 text-sm text-[var(--pep-ink-soft)]">
              Loading your rooms...
            </p>
          ) : myRooms.length === 0 ? (
            <p className="mt-4 rounded-[12px] border border-dashed border-[var(--pep-line-strong)] bg-white/70 px-4 py-3 text-sm text-[var(--pep-ink-soft)]">
              You are not currently part of any rooms on this browser.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {myRooms.map((roomSummary) => {
                const isPending = pendingRoomActionId === roomSummary.roomId

                return (
                  <div
                    key={roomSummary.roomId}
                    className="rounded-[12px] border border-[var(--pep-line)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.94),_rgba(237,245,242,0.92))] p-3 shadow-[0_8px_20px_rgba(12,32,42,0.05)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-[var(--pep-font-display)] text-2xl text-[var(--pep-ink)]">
                          {roomSummary.roomName}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.06em]">
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-800">
                            {onlineCountByRoomName[roomSummary.roomName] ?? 0}{' '}
                            online
                          </span>
                          <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700">
                            {roomSummary.participantCount} in room
                          </span>
                          <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-800">
                            {roomSummary.isCurrentClientOwner
                              ? 'owner'
                              : (roomSummary.currentClientRole ??
                                'participant')}
                          </span>
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">
                            {getThemeConfig(roomSummary.themeId).label}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openSavedRoom(roomSummary)}
                          className="rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-3 py-2 text-xs font-black uppercase text-[var(--pep-ink)] shadow-[0_6px_14px_rgba(12,32,42,0.08)]"
                        >
                          Open room
                        </button>
                        {roomSummary.isCurrentClientOwner ? null : (
                          <button
                            type="button"
                            onClick={() =>
                              void handleLeaveSavedRoom(roomSummary)
                            }
                            disabled={isPending}
                            className="rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-3 py-2 text-xs font-black uppercase text-[var(--pep-ink)] shadow-[0_6px_14px_rgba(12,32,42,0.08)] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            Leave room
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase text-[var(--pep-ink)]">
          <span className="rounded-full bg-[var(--pep-yellow)] px-3 py-2">
            Fibonacci
          </span>
          <span className="rounded-full bg-[var(--pep-mint)] px-3 py-2">
            Private votes
          </span>
          <span className="rounded-full bg-white/80 px-3 py-2">
            Auto reveal
          </span>
        </div>
      </div>

      <aside className="rounded-[14px] border border-[var(--pep-line)] bg-[var(--pep-panel-strong)] p-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-black uppercase text-[var(--pep-accent)]">
            {activeTheme.crewLabel}
          </p>
          <img
            src={activeTheme.vehiclePath}
            alt={activeTheme.vehicleLabel}
            className="w-36"
          />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 lg:grid-cols-2">
          {avatarOptions.map((avatar) => (
            <div
              key={avatar.key}
              className="overflow-hidden rounded-[10px] border border-[var(--pep-line)] bg-white/88 p-2"
            >
              <img
                src={avatar.portraitPath}
                alt={avatar.label}
                className={getAvatarPortraitClassName(
                  avatar,
                  'aspect-square w-full rounded-[8px] object-cover'
                )}
              />
            </div>
          ))}
        </div>
      </aside>
    </motion.section>
  )
}
