import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../../lib/supabase/client'
import type { RoomFunEvent } from '../fun'
import type { Room } from '../types'

type BroadcastFunEvent = RoomFunEvent & {
  id: string
}

export function useRoomFunEvents(room: Room | null) {
  const [incomingFunEvent, setIncomingFunEvent] =
    useState<BroadcastFunEvent | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (!room) {
      channelRef.current = null
      return
    }

    const channel = supabase.channel(`room-fun:${room.id}`, {
      config: {
        broadcast: {
          self: true,
        },
      },
    })

    channelRef.current = channel

    channel
      .on('broadcast', { event: 'fun-event' }, ({ payload }) => {
        setIncomingFunEvent(payload as BroadcastFunEvent)
      })
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED')
      })

    return () => {
      channelRef.current = null
      setIsSubscribed(false)
      void supabase.removeChannel(channel)
    }
  }, [room])

  async function sendFunEvent(event: RoomFunEvent) {
    if (!channelRef.current || !isSubscribed) {
      return false
    }

    const result = await channelRef.current.send({
      type: 'broadcast',
      event: 'fun-event',
      payload: {
        ...event,
        id: window.crypto.randomUUID(),
      },
    })

    return result === 'ok'
  }

  return {
    incomingFunEvent: room ? incomingFunEvent : null,
    sendFunEvent,
  }
}
