import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { supabase } from '../../../lib/supabase/client'
import type { RoomFunEvent } from '../fun'
import type { Room } from '../types'

const broadcastFunEventSchema = z
  .object({
    id: z.string().uuid(),
    caption: z.string().min(1).max(64),
    mode: z.enum([
      'celebration',
      'chaos',
      'delivery',
      'deliveryStorm',
      'flyby',
      'hypnotoad',
      'milestone',
    ]),
    quote: z
      .object({
        avatarPath: z
          .string()
          .regex(/^\/(?:avatars|cards)\//)
          .max(128),
        speaker: z.string().min(1).max(64),
        text: z.string().min(1).max(160),
      })
      .optional(),
  })
  .strict()

type BroadcastFunEvent = z.infer<typeof broadcastFunEventSchema>

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
        const parsedPayload = broadcastFunEventSchema.safeParse(payload)

        if (parsedPayload.success) {
          setIncomingFunEvent(parsedPayload.data)
        }
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
