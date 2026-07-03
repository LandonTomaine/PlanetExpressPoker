import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase/client'
import { listParticipants } from '../data/roomApi'
import type {
  JoinedParticipant,
  Participant,
  PresenceParticipant,
  Room,
} from '../types'

type UseRoomLiveStateResult = {
  participants: Participant[]
  presenceByParticipantId: Record<string, PresenceParticipant>
  errorMessage: string | null
}

export function useRoomLiveState(input: {
  room: Room | null
  selfParticipant: JoinedParticipant | null
}): UseRoomLiveStateResult {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [presenceByParticipantId, setPresenceByParticipantId] = useState<
    Record<string, PresenceParticipant>
  >({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const room = input.room
  const selfParticipant = input.selfParticipant

  useEffect(() => {
    if (!room) {
      return
    }

    let isCancelled = false
    const channel = supabase.channel(`room:${room.name}`)

    const syncParticipants = async () => {
      try {
        const nextParticipants = await listParticipants(room.id)

        if (!isCancelled) {
          setParticipants(nextParticipants)
          setErrorMessage(null)
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Failed to sync participants.'
          )
        }
      }
    }

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState<PresenceParticipant>()
        const nextPresenceState: Record<string, PresenceParticipant> = {}

        for (const presences of Object.values(presenceState)) {
          for (const presence of presences) {
            nextPresenceState[presence.participantId] = presence
          }
        }

        if (!isCancelled) {
          setPresenceByParticipantId(nextPresenceState)
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `room_id=eq.${room.id}`,
        },
        () => {
          void syncParticipants()
        }
      )
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') {
          return
        }

        await syncParticipants()

        if (selfParticipant) {
          await channel.track({
            participantId: selfParticipant.participantId,
            displayName: selfParticipant.displayName,
            avatarKey: selfParticipant.avatarKey,
            role: selfParticipant.role,
            onlineAt: new Date().toISOString(),
          })
        }
      })

    void syncParticipants()
    const syncIntervalId = window.setInterval(() => {
      void syncParticipants()
    }, 3000)

    return () => {
      isCancelled = true
      window.clearInterval(syncIntervalId)
      void supabase.removeChannel(channel)
    }
  }, [room, selfParticipant])

  return {
    participants: room ? participants : [],
    presenceByParticipantId: room ? presenceByParticipantId : {},
    errorMessage: room ? errorMessage : null,
  }
}
