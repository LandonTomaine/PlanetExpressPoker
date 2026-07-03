import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../../lib/supabase/client'
import { getActiveRound, listVotes } from '../data/roomApi'
import type { Room, Round, Vote } from '../types'

type UseVotingLiveStateResult = {
  activeRound: Round | null
  votes: Vote[]
  errorMessage: string | null
}

export function useVotingLiveState(
  room: Room | null
): UseVotingLiveStateResult {
  const [activeRound, setActiveRound] = useState<Round | null>(null)
  const [votes, setVotes] = useState<Vote[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const lastRoundKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!room) {
      return
    }

    let isCancelled = false

    const syncRound = async () => {
      try {
        const nextRound = await getActiveRound(room.id)

        if (isCancelled) {
          return
        }

        const nextRoundKey = `${nextRound.id}:${nextRound.roundNumber}`

        if (
          lastRoundKeyRef.current !== null &&
          lastRoundKeyRef.current !== nextRoundKey
        ) {
          setVotes([])
        }

        lastRoundKeyRef.current = nextRoundKey
        setActiveRound(nextRound)

        const nextVotes = await listVotes(nextRound.id)

        if (!isCancelled) {
          setVotes(nextVotes)
          setErrorMessage(null)
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Failed to sync vote state.'
          )
        }
      }
    }

    const channel = supabase
      .channel(`room-votes:${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
        },
        () => {
          void syncRound()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rounds',
          filter: `room_id=eq.${room.id}`,
        },
        () => {
          void syncRound()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void syncRound()
        }
      })

    void syncRound()
    const syncIntervalId = window.setInterval(() => {
      void syncRound()
    }, 3000)

    return () => {
      isCancelled = true
      lastRoundKeyRef.current = null
      window.clearInterval(syncIntervalId)
      void supabase.removeChannel(channel)
    }
  }, [room])

  return {
    activeRound: room ? activeRound : null,
    votes: room ? votes : [],
    errorMessage: room ? errorMessage : null,
  }
}
