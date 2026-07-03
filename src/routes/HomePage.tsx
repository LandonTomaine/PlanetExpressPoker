import { motion } from 'motion/react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  avatarOptions,
  getAvatarPortraitClassName,
} from '../features/identity/avatars'
import {
  maxDisplayNameLength,
  normalizeDisplayName,
} from '../features/identity/displayName'
import {
  readActiveRoomName,
  readStoredIdentity,
  saveActiveRoomName,
  saveStoredIdentity,
} from '../features/identity/storage'
import {
  getRoomNameError,
  maxRoomNameLength,
  normalizeRoomName,
  roomNameInputPattern,
} from '../features/room/roomName'

export function HomePage() {
  const navigate = useNavigate()
  const [roomName, setRoomName] = useState(() => readActiveRoomName() ?? '')
  const [identity, setIdentity] = useState(() => readStoredIdentity())
  const roomNameError = getRoomNameError(roomName)
  const hasDisplayName = Boolean(normalizeDisplayName(identity.displayName))
  const canOpenRoom = !roomNameError && hasDisplayName

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
    navigate(`/rooms/${encodeURIComponent(normalizedRoomName)}`)
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
          Realtime estimation
        </p>
        <h2 className="mt-2 font-[var(--pep-font-display)] text-4xl leading-none text-[var(--pep-ink)] sm:text-5xl">
          Planet Express Poker
        </h2>
        <p className="mt-3 max-w-xl text-base leading-7 text-[var(--pep-ink-soft)]">
          Open a room, vote privately, reveal together.
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
                placeholder="Hermes"
                className="mt-2 w-full rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--pep-accent-2)]"
              />
            </label>
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
              Create or join room
            </button>
          </div>
          <p className="mt-3 text-sm text-[var(--pep-ink-soft)]">
            Your name and avatar are remembered on this browser. Names are
            limited to {maxDisplayNameLength} characters.
          </p>
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
            Delivery crew
          </p>
          <img
            src="/planet-express-ship.png"
            alt="Planet Express ship"
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
