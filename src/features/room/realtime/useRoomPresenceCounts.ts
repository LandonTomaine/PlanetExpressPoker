import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase/client'
import type { PresenceParticipant } from '../types'

export function useRoomPresenceCounts(roomNames: string[]) {
  const [onlineCountByRoomName, setOnlineCountByRoomName] = useState<
    Record<string, number>
  >({})
  const normalizedRoomNamesKey = useMemo(() => {
    return Array.from(
      new Set(roomNames.map((roomName) => roomName.trim()).filter(Boolean))
    )
      .sort()
      .join('\n')
  }, [roomNames])

  const activeRoomNames = useMemo(() => {
    return normalizedRoomNamesKey ? normalizedRoomNamesKey.split('\n') : []
  }, [normalizedRoomNamesKey])

  useEffect(() => {
    if (activeRoomNames.length === 0) {
      return
    }

    let isCancelled = false

    const channels = activeRoomNames.map((roomName) => {
      const channel = supabase.channel(`room:${roomName}`)

      channel
        .on('presence', { event: 'sync' }, () => {
          if (isCancelled) {
            return
          }

          const presenceState = channel.presenceState<PresenceParticipant>()
          const participantIds = new Set<string>()

          for (const presences of Object.values(presenceState)) {
            for (const presence of presences) {
              participantIds.add(presence.participantId)
            }
          }

          setOnlineCountByRoomName((currentCounts) => ({
            ...currentCounts,
            [roomName]: participantIds.size,
          }))
        })
        .subscribe()

      return channel
    })

    return () => {
      isCancelled = true

      for (const channel of channels) {
        void supabase.removeChannel(channel)
      }
    }
  }, [activeRoomNames])

  return Object.fromEntries(
    activeRoomNames.map((roomName) => [
      roomName,
      onlineCountByRoomName[roomName] ?? 0,
    ])
  )
}
