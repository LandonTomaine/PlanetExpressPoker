import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase/client'
import { getRoomSettings } from '../data/roomApi'
import type { Room, RoomSettings } from '../types'

type UseRoomSettingsLiveStateResult = {
  errorMessage: string | null
  roomSettings: RoomSettings | null
}

export function useRoomSettingsLiveState(
  room: Room | null
): UseRoomSettingsLiveStateResult {
  const [roomSettings, setRoomSettings] = useState<RoomSettings | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!room) {
      return
    }

    let isCancelled = false

    const syncRoomSettings = async () => {
      try {
        const nextRoomSettings = await getRoomSettings(room.id)

        if (!isCancelled) {
          setRoomSettings(nextRoomSettings)
          setErrorMessage(null)
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Failed to sync room settings.'
          )
        }
      }
    }

    const channel = supabase
      .channel(`room-settings:${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_settings',
          filter: `room_id=eq.${room.id}`,
        },
        () => {
          void syncRoomSettings()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void syncRoomSettings()
        }
      })

    void syncRoomSettings()

    return () => {
      isCancelled = true
      void supabase.removeChannel(channel)
    }
  }, [room])

  return {
    errorMessage: room ? errorMessage : null,
    roomSettings: room ? roomSettings : null,
  }
}
