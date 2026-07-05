import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  clearActiveRoomName,
  clearRoomNamePrefill,
  readActiveRoomName,
  readStoredIdentity,
  saveActiveRoomName,
  saveRoomNamePrefill,
} from '../features/identity/storage'
import { listRooms, shutdownRoom } from '../features/room/data/roomApi'
import { useRoomPresenceCounts } from '../features/room/realtime/useRoomPresenceCounts'
import type { RoomSummary } from '../features/room/types'

const roomsPageSize = 25

export function RoomsPage() {
  const navigate = useNavigate()
  const [identity] = useState(() => readStoredIdentity())
  const [pageIndex, setPageIndex] = useState(0)
  const [rooms, setRooms] = useState<RoomSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pendingRoomActionId, setPendingRoomActionId] = useState<string | null>(
    null
  )
  const onlineCountByRoomName = useRoomPresenceCounts(
    rooms.map((roomSummary) => roomSummary.roomName)
  )

  useEffect(() => {
    let isCancelled = false

    const loadRooms = async () => {
      setIsLoading(true)

      try {
        const nextRooms = await listRooms({
          actorClientId: identity.clientId,
          pageOffset: pageIndex * roomsPageSize,
          pageSize: roomsPageSize,
        })

        if (!isCancelled) {
          setRooms(nextRooms)
          setErrorMessage(null)
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Failed to load rooms.'
          )
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadRooms()

    return () => {
      isCancelled = true
    }
  }, [identity.clientId, pageIndex])

  async function refreshRooms() {
    setIsLoading(true)

    try {
      const nextRooms = await listRooms({
        actorClientId: identity.clientId,
        pageOffset: pageIndex * roomsPageSize,
        pageSize: roomsPageSize,
      })

      setRooms(nextRooms)
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load rooms.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  function openRoom(summary: RoomSummary) {
    saveActiveRoomName(summary.roomName)
    saveRoomNamePrefill(summary.roomName)
    navigate({
      pathname: `/rooms/${encodeURIComponent(summary.roomName)}`,
      search:
        summary.currentClientRole === 'spectator' ? '?joinAs=spectator' : '',
    })
  }

  async function handleShutdownRoom(summary: RoomSummary) {
    if (!window.confirm(`Close room "${summary.roomName}" for everyone?`)) {
      return
    }

    setPendingRoomActionId(summary.roomId)
    setErrorMessage(null)

    try {
      await shutdownRoom({
        roomId: summary.roomId,
        actorClientId: identity.clientId,
      })

      if (readActiveRoomName() === summary.roomName) {
        clearActiveRoomName()
        clearRoomNamePrefill()
      }

      await refreshRooms()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to close room.'
      )
    } finally {
      setPendingRoomActionId(null)
    }
  }

  const canGoToPreviousPage = pageIndex > 0
  const canGoToNextPage = rooms.length === roomsPageSize

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className="rounded-[16px] border border-[var(--pep-line)] bg-[linear-gradient(160deg,_rgba(255,255,255,0.95),_rgba(222,245,236,0.86))] p-5 shadow-[0_16px_42px_rgba(12,32,42,0.1)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-[var(--pep-accent)]">
            Room directory
          </p>
          <h2 className="mt-2 font-[var(--pep-font-display)] text-4xl leading-none text-[var(--pep-ink)] sm:text-5xl">
            Open rooms
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--pep-ink-soft)]">
            Browse active rooms, jump in quickly, and close the ones you own.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refreshRooms()}
          disabled={isLoading}
          className="rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-3 py-2 text-xs font-black uppercase text-[var(--pep-ink)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          Refresh
        </button>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-[var(--pep-accent)]/20 bg-[var(--pep-accent)]/10 px-4 py-3 text-sm font-medium text-[var(--pep-accent)]">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <p className="mt-5 rounded-[12px] border border-[var(--pep-line)] bg-white/75 px-4 py-3 text-sm text-[var(--pep-ink-soft)]">
          Loading rooms...
        </p>
      ) : rooms.length === 0 ? (
        <p className="mt-5 rounded-[12px] border border-dashed border-[var(--pep-line-strong)] bg-white/75 px-4 py-3 text-sm text-[var(--pep-ink-soft)]">
          No active rooms matched this page.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {rooms.map((roomSummary) => {
            const isPending = pendingRoomActionId === roomSummary.roomId

            return (
              <article
                key={roomSummary.roomId}
                className="rounded-[14px] border border-[var(--pep-line)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(236,245,241,0.93))] p-4 shadow-[0_10px_24px_rgba(12,32,42,0.06)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-[var(--pep-font-display)] text-3xl leading-none text-[var(--pep-ink)]">
                      {roomSummary.roomName}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.06em]">
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-800">
                        {onlineCountByRoomName[roomSummary.roomName] ?? 0}{' '}
                        online
                      </span>
                      <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700">
                        {roomSummary.participantCount} in room
                      </span>
                      {roomSummary.currentClientRole ? (
                        <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-800">
                          {roomSummary.isCurrentClientOwner
                            ? 'you own this room'
                            : `you are ${roomSummary.currentClientRole}`}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openRoom(roomSummary)}
                      className="rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-3 py-2 text-xs font-black uppercase text-[var(--pep-ink)] shadow-[0_6px_14px_rgba(12,32,42,0.08)]"
                    >
                      Open room
                    </button>
                    {roomSummary.isCurrentClientOwner ? (
                      <button
                        type="button"
                        onClick={() => void handleShutdownRoom(roomSummary)}
                        disabled={isPending}
                        className="rounded-[10px] border border-[var(--pep-accent)] bg-white px-3 py-2 text-xs font-black uppercase text-[var(--pep-accent)] shadow-[0_6px_14px_rgba(212,47,38,0.12)] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        Close room
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--pep-ink-soft)]">
          Page {pageIndex + 1}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPageIndex((currentPage) => currentPage - 1)}
            disabled={!canGoToPreviousPage || isLoading}
            className="rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-3 py-2 text-xs font-black uppercase text-[var(--pep-ink)] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPageIndex((currentPage) => currentPage + 1)}
            disabled={!canGoToNextPage || isLoading}
            className="rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-3 py-2 text-xs font-black uppercase text-[var(--pep-ink)] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
          >
            Next
          </button>
        </div>
      </div>
    </motion.section>
  )
}
