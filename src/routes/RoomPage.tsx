import { motion } from 'motion/react'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  getAvatarOption,
  avatarOptions,
  getAvatarPortraitClassName,
} from '../features/identity/avatars'
import {
  maxDisplayNameLength,
  normalizeDisplayName,
} from '../features/identity/displayName'
import {
  clearActiveRoomName,
  createClientId,
  readActiveRoomName,
  readStoredIdentity,
  saveActiveRoomName,
  saveStoredIdentity,
} from '../features/identity/storage'
import {
  createOrGetRoom,
  joinRoom,
  kickParticipant,
  leaveRoom,
  resetRound,
  revealRound,
  setRoomFunLevel,
  setParticipantRole,
  shutdownRoom,
  startRevealCountdown,
  submitVote,
} from '../features/room/data/roomApi'
import { FunLayer } from '../features/room/FunLayer'
import {
  consensusCaption,
  deliveryCaption,
  milestoneCaption,
  revealCaption,
  consensusQuotes,
  revealQuotes,
  type RoomFunEvent,
} from '../features/room/fun'
import { useRoomFunEvents } from '../features/room/realtime/useRoomFunEvents'
import { useRoomLiveState } from '../features/room/realtime/useRoomLiveState'
import { useRoomSettingsLiveState } from '../features/room/realtime/useRoomSettingsLiveState'
import { useVotingLiveState } from '../features/room/realtime/useVotingLiveState'
import { buildScoreSummary } from '../features/room/summary'
import {
  fibonacciDeck,
  getCardDisplayLabel,
  getCardMeaningLabel,
  numericCardValues,
} from '../features/room/voting'
import type { JoinedParticipant, Room } from '../features/room/types'

type RoundReactionKind =
  | 'coffee1'
  | 'coffee2'
  | 'coffee3'
  | 'coffee4'
  | 'consensus1'
  | 'consensus2'
  | 'consensus3'
  | 'consensus4'
  | 'consensus5'
  | 'nibblerQuestion'
  | 'shipInfinity'
  | 'skepticalFry'
  | 'wideSpread1'
  | 'wideSpread2'

type RoundReactionDisplay = {
  mediaType: 'image' | 'video'
  mediaClassName: string
  src: string
}

const numericCardIndexByValue = new Map(
  numericCardValues.map((cardValue, index) => [cardValue, index])
)

const roundReactionConfig: Record<RoundReactionKind, RoundReactionDisplay> = {
  coffee1: {
    mediaType: 'image',
    src: '/effects/coffee-1.gif',
    mediaClassName: 'h-36 w-52 rounded-[14px] object-cover sm:h-44 sm:w-64',
  },
  coffee2: {
    mediaType: 'image',
    src: '/effects/coffee-2.gif',
    mediaClassName: 'h-36 w-52 rounded-[14px] object-cover sm:h-44 sm:w-64',
  },
  coffee3: {
    mediaType: 'image',
    src: '/effects/coffee-3.gif',
    mediaClassName: 'h-36 w-52 rounded-[14px] object-cover sm:h-44 sm:w-64',
  },
  coffee4: {
    mediaType: 'image',
    src: '/effects/coffee-4.gif',
    mediaClassName: 'h-36 w-52 rounded-[14px] object-cover sm:h-44 sm:w-64',
  },
  consensus1: {
    mediaType: 'image',
    src: '/effects/hypnotoad.gif',
    mediaClassName: 'h-44 w-44 object-contain sm:h-56 sm:w-56',
  },
  consensus2: {
    mediaType: 'image',
    src: '/effects/consensus-2.gif',
    mediaClassName: 'h-36 w-52 rounded-[14px] object-cover sm:h-44 sm:w-64',
  },
  consensus3: {
    mediaType: 'image',
    src: '/effects/consensus-3.gif',
    mediaClassName: 'h-36 w-52 rounded-[14px] object-cover sm:h-44 sm:w-64',
  },
  consensus4: {
    mediaType: 'image',
    src: '/effects/consensus-4.gif',
    mediaClassName: 'h-36 w-52 rounded-[14px] object-cover sm:h-44 sm:w-64',
  },
  consensus5: {
    mediaType: 'image',
    src: '/effects/consensus-5.gif',
    mediaClassName: 'h-36 w-52 rounded-[14px] object-cover sm:h-44 sm:w-64',
  },
  nibblerQuestion: {
    mediaType: 'image',
    src: '/effects/nibbler-question.gif',
    mediaClassName: 'h-36 w-52 rounded-[14px] object-cover sm:h-44 sm:w-64',
  },
  shipInfinity: {
    mediaType: 'image',
    src: '/effects/ship-infinity.gif',
    mediaClassName: 'h-36 w-52 rounded-[14px] object-cover sm:h-44 sm:w-64',
  },
  skepticalFry: {
    mediaType: 'video',
    src: '/effects/skeptical-fry.webm',
    mediaClassName: 'h-36 w-52 rounded-[14px] object-cover sm:h-44 sm:w-64',
  },
  wideSpread1: {
    mediaType: 'image',
    src: '/effects/wide-spread-1.gif',
    mediaClassName: 'h-36 w-52 rounded-[14px] object-cover sm:h-44 sm:w-64',
  },
  wideSpread2: {
    mediaType: 'image',
    src: '/effects/wide-spread-2.gif',
    mediaClassName: 'h-36 w-52 rounded-[14px] object-cover sm:h-44 sm:w-64',
  },
}

const coffeeReactionKinds = [
  'coffee1',
  'coffee2',
  'coffee3',
  'coffee4',
] as const
const consensusReactionKinds = [
  'consensus1',
  'consensus2',
  'consensus3',
  'consensus4',
  'consensus5',
] as const
const wideSpreadReactionKinds = ['wideSpread1', 'wideSpread2'] as const

export function RoomPage() {
  const navigate = useNavigate()
  const { roomName: roomNameParam = '' } = useParams()
  const normalizedRoomName = roomNameParam.trim()
  const autoJoinAttemptedRef = useRef(false)
  const selfParticipantSyncGraceUntilRef = useRef(0)
  const [room, setRoom] = useState<Room | null>(null)
  const [roomError, setRoomError] = useState<string | null>(null)
  const [isRoomLoading, setIsRoomLoading] = useState(true)
  const [selfParticipant, setSelfParticipant] =
    useState<JoinedParticipant | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [voteError, setVoteError] = useState<string | null>(null)
  const [isVoteSubmitting, setIsVoteSubmitting] = useState(false)
  const [revealError, setRevealError] = useState<string | null>(null)
  const [isRevealSubmitting, setIsRevealSubmitting] = useState(false)
  const [isCountdownSubmitting, setIsCountdownSubmitting] = useState(false)
  const [isResetSubmitting, setIsResetSubmitting] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [isFunLevelSaving, setIsFunLevelSaving] = useState(false)
  const [isShutdownSubmitting, setIsShutdownSubmitting] = useState(false)
  const [isShutdownConfirmOpen, setIsShutdownConfirmOpen] = useState(false)
  const [countdownNow, setCountdownNow] = useState(() => Date.now())
  const [participantActionError, setParticipantActionError] = useState<
    string | null
  >(null)
  const [pendingParticipantActionId, setPendingParticipantActionId] = useState<
    string | null
  >(null)
  const [optimisticOwnCardValue, setOptimisticOwnCardValue] = useState<
    string | null
  >(null)
  const [inviteState, setInviteState] = useState<'idle' | 'copied' | 'failed'>(
    'idle'
  )
  const [identity, setIdentity] = useState(() => readStoredIdentity())
  const [activeFunEvent, setActiveFunEvent] = useState<RoomFunEvent | null>(
    null
  )
  const [activeRoundReaction, setActiveRoundReaction] =
    useState<RoundReactionKind | null>(null)
  const [displayName, setDisplayName] = useState(
    () => readStoredIdentity().displayName
  )
  const [avatarKey, setAvatarKey] = useState(
    () => readStoredIdentity().avatarKey
  )
  const { participants, presenceByParticipantId, errorMessage } =
    useRoomLiveState({ room, selfParticipant })
  const { roomSettings, errorMessage: roomSettingsErrorMessage } =
    useRoomSettingsLiveState(room)
  const {
    activeRound,
    votes,
    errorMessage: votingErrorMessage,
  } = useVotingLiveState({
    actorClientId: selfParticipant ? identity.clientId : null,
    room,
  })
  const { incomingFunEvent, sendFunEvent } = useRoomFunEvents(room)
  const selfRosterParticipant = participants.find(
    (participant) => participant.id === selfParticipant?.participantId
  )
  const roomOwnerParticipantId = participants[0]?.id ?? null
  const isSelfRoomOwner =
    Boolean(roomOwnerParticipantId) &&
    selfParticipant?.participantId === roomOwnerParticipantId
  const effectiveSelfRole = selfRosterParticipant?.role ?? selfParticipant?.role
  const isJoinedToRoom = Boolean(selfParticipant && selfRosterParticipant)
  const countdownAttemptRef = useRef<string | null>(null)
  const lastSeenRoundNumberRef = useRef<number | null>(null)
  const locallyObservedRoundIdsRef = useRef<Set<string>>(new Set())
  const revealedFunRoundKeyRef = useRef<string | null>(null)
  const milestoneRoundKeyRef = useRef<string | null>(null)
  const roundReactionRoundKeyRef = useRef<string | null>(null)
  const roundReactionTimeoutRef = useRef<number | null>(null)
  const funEventTimeoutRef = useRef<number | null>(null)

  const attemptAutoJoin = useEffectEvent(async () => {
    await handleJoin({
      displayName: identity.displayName,
      avatarKey: identity.avatarKey,
      silent: true,
    })
  })

  const startRevealCountdownEvent = useEffectEvent(async () => {
    await handleRevealCountdown()
  })

  const finalizeRevealEvent = useEffectEvent(async () => {
    await finalizeReveal()
  })

  function getFunEventDuration(event: RoomFunEvent) {
    if (event.mode === 'celebration') {
      return 7200
    }

    if (event.mode === 'flyby') {
      return 2500
    }

    if (event.mode === 'delivery') {
      return 8400
    }

    if (event.mode === 'milestone') {
      return 10000
    }

    return 6600
  }

  function showFunEvent(event: RoomFunEvent) {
    if (event.mode === 'delivery' && activeFunEvent?.mode === 'delivery') {
      return
    }

    if (event.quote && roundReactionKind) {
      return
    }

    if (funEventTimeoutRef.current !== null) {
      window.clearTimeout(funEventTimeoutRef.current)
    }

    setActiveFunEvent(event)
    funEventTimeoutRef.current = window.setTimeout(() => {
      setActiveFunEvent(null)
      funEventTimeoutRef.current = null
    }, getFunEventDuration(event))
  }

  const showFunEventEvent = useEffectEvent((event: RoomFunEvent) => {
    showFunEvent(event)
  })

  const broadcastFunEvent = useEffectEvent(async (event: RoomFunEvent) => {
    showFunEvent(event)
    await sendFunEvent(event)
  })

  function resetForSelfKick() {
    clearActiveRoomName()
    setSelfParticipant(null)
    setOptimisticOwnCardValue(null)
    setVoteError('You were kicked from this room.')
    setParticipantActionError(null)
  }

  function resetForSelfLeave() {
    clearActiveRoomName()
    setSelfParticipant(null)
    setOptimisticOwnCardValue(null)
    setVoteError(null)
    setRevealError(null)
    setParticipantActionError(null)
  }

  useEffect(() => {
    let isCancelled = false

    const loadRoom = async () => {
      autoJoinAttemptedRef.current = false
      setIsRoomLoading(true)
      setRoomError(null)
      setSelfParticipant(null)

      if (!normalizedRoomName) {
        setIsRoomLoading(false)
        setRoomError('Room name is required.')
        return
      }

      try {
        const nextRoom = await createOrGetRoom(normalizedRoomName)

        if (!isCancelled) {
          setRoom(nextRoom)
          setRoomError(null)
        }
      } catch (error) {
        if (!isCancelled) {
          setRoomError(
            error instanceof Error ? error.message : 'Failed to open room.'
          )
        }
      } finally {
        if (!isCancelled) {
          setIsRoomLoading(false)
        }
      }
    }

    void loadRoom()

    return () => {
      isCancelled = true
    }
  }, [normalizedRoomName])

  useEffect(() => {
    if (!room || selfParticipant || autoJoinAttemptedRef.current) {
      return
    }

    if (readActiveRoomName() !== room.name) {
      return
    }

    if (!identity.displayName.trim()) {
      return
    }

    autoJoinAttemptedRef.current = true
    void attemptAutoJoin()
  }, [identity, room, selfParticipant])

  useEffect(() => {
    if (!selfParticipant) {
      return
    }

    const syncedSelfParticipant = participants.find(
      (participant) => participant.id === selfParticipant.participantId
    )

    if (syncedSelfParticipant) {
      selfParticipantSyncGraceUntilRef.current = 0

      if (
        syncedSelfParticipant.id !== selfParticipant.participantId ||
        syncedSelfParticipant.role !== selfParticipant.role ||
        syncedSelfParticipant.displayName !== selfParticipant.displayName ||
        syncedSelfParticipant.avatarKey !== selfParticipant.avatarKey
      ) {
        queueMicrotask(() => {
          setSelfParticipant({
            participantId: syncedSelfParticipant.id,
            roomId: syncedSelfParticipant.roomId,
            roomName: room?.name ?? selfParticipant.roomName,
            displayName: syncedSelfParticipant.displayName,
            avatarKey: syncedSelfParticipant.avatarKey,
            role: syncedSelfParticipant.role,
            isKicked: syncedSelfParticipant.isKicked,
          })
        })
      }

      return
    }

    if (Date.now() < selfParticipantSyncGraceUntilRef.current) {
      return
    }

    queueMicrotask(() => {
      resetForSelfKick()
    })
  }, [identity.clientId, participants, room?.name, selfParticipant])

  useEffect(() => {
    selfParticipantSyncGraceUntilRef.current = 0
  }, [room?.id])

  async function handleJoin(input?: {
    displayName: string
    avatarKey: string
    silent?: boolean
  }) {
    if (!room) {
      return
    }

    const activeRoom = room
    const nextDisplayName = normalizeDisplayName(
      input?.displayName ?? displayName
    )
    const nextAvatarKey = input?.avatarKey ?? avatarKey

    setIsJoining(true)
    setJoinError(null)

    try {
      await joinWithClientId(identity.clientId)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to join room.'

      if (errorMessage === 'You were kicked from this room' && !input?.silent) {
        try {
          await joinWithClientId(createClientId())
        } catch (retryError) {
          setJoinError(
            retryError instanceof Error
              ? retryError.message
              : 'Failed to join room.'
          )
        }
      } else if (!input?.silent) {
        setJoinError(errorMessage)
      } else {
        setJoinError(
          error instanceof Error ? error.message : 'Reconnect failed.'
        )
      }
    } finally {
      setIsJoining(false)
    }

    async function joinWithClientId(clientId: string) {
      const participant = await joinRoom({
        roomName: activeRoom.name,
        clientId,
        displayName: nextDisplayName,
        avatarKey: nextAvatarKey,
      })

      const nextIdentity = {
        clientId,
        displayName: participant.displayName,
        avatarKey: participant.avatarKey,
      }

      selfParticipantSyncGraceUntilRef.current = Date.now() + 4_000
      saveStoredIdentity(nextIdentity)
      saveActiveRoomName(activeRoom.name)
      setIdentity(nextIdentity)
      setDisplayName(participant.displayName)
      setAvatarKey(participant.avatarKey)
      setSelfParticipant(participant)
      setVoteError(null)
      setRevealError(null)
      setParticipantActionError(null)
    }
  }

  async function copyInviteLink() {
    try {
      await window.navigator.clipboard.writeText(window.location.href)
      setInviteState('copied')
    } catch {
      setInviteState('failed')
    }
  }

  const ownVote = votes.find(
    (vote) =>
      vote.participantId === selfParticipant?.participantId &&
      vote.roundId === activeRound?.id
  )
  const displayedOwnCardValue = ownVote?.cardValue ?? optimisticOwnCardValue

  const activeRoundVotes = votes.filter(
    (vote) => vote.roundId === activeRound?.id
  )
  const submittedVoteParticipantIds = new Set(
    activeRoundVotes.map((vote) => vote.participantId)
  )
  const hasSubmittedVotes = activeRoundVotes.length > 0
  const canReveal =
    isJoinedToRoom &&
    !isRevealSubmitting &&
    Boolean(activeRound) &&
    hasSubmittedVotes &&
    activeRound?.status !== 'revealed'
  const canStartCountdown =
    isJoinedToRoom &&
    !isCountdownSubmitting &&
    Boolean(activeRound) &&
    hasSubmittedVotes &&
    activeRound?.status === 'voting'
  const canResetRound =
    isJoinedToRoom &&
    !isResetSubmitting &&
    Boolean(activeRound) &&
    activeRound?.status === 'revealed'
  const canShutdownRoom =
    isJoinedToRoom && isSelfRoomOwner && !isShutdownSubmitting
  const activeVoters = participants.filter(
    (participant) => participant.role === 'voter'
  )
  const areFunEffectsEnabled = roomSettings?.funLevel === 'chaotic'
  const isDeliveryInProgress = activeFunEvent?.mode === 'delivery'
  const allVotersHaveSubmitted =
    activeVoters.length > 0 &&
    activeVoters.every((participant) =>
      submittedVoteParticipantIds.has(participant.id)
    )
  const revealedVoteByParticipantId = new Map(
    activeRoundVotes.map((vote) => [vote.participantId, vote.cardValue])
  )
  const revealedCardValues = Array.from(revealedVoteByParticipantId.values())
  const scoreSummary = buildScoreSummary(revealedCardValues)
  const hasMatchingNumericVotes = hasNumericConsensus(revealedCardValues)
  const isConsensusCelebration =
    activeRound?.status === 'revealed' &&
    allVotersHaveSubmitted &&
    scoreSummary.unanimousNumericValue !== null
  const roundReactionKind =
    activeRound?.status === 'revealed'
      ? getRoundReactionKind(
          revealedCardValues,
          hasMatchingNumericVotes,
          activeRound.id
        )
      : null
  const isMilestoneRound =
    activeRound?.status === 'revealed' && activeRound.roundNumber % 100 === 0

  const countdownSecondsRemaining =
    activeRound?.status === 'countdown' && activeRound.countdownStartedAt
      ? Math.max(
          0,
          Math.ceil(
            (new Date(activeRound.countdownStartedAt).getTime() +
              activeRound.countdownSeconds * 1000 -
              countdownNow) /
              1000
          )
        )
      : null

  useEffect(() => {
    return () => {
      if (funEventTimeoutRef.current !== null) {
        window.clearTimeout(funEventTimeoutRef.current)
      }
      if (roundReactionTimeoutRef.current !== null) {
        window.clearTimeout(roundReactionTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!incomingFunEvent) {
      return
    }

    queueMicrotask(() => {
      showFunEventEvent(incomingFunEvent)
    })
  }, [incomingFunEvent])

  useEffect(() => {
    if (activeRound?.status !== 'countdown') {
      return
    }

    const intervalId = window.setInterval(() => {
      setCountdownNow(Date.now())
    }, 250)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [activeRound?.countdownStartedAt, activeRound?.status])

  useEffect(() => {
    if (!activeRound) {
      lastSeenRoundNumberRef.current = null
      return
    }

    if (activeRound.status !== 'revealed') {
      locallyObservedRoundIdsRef.current.add(activeRound.id)
    }

    if (lastSeenRoundNumberRef.current === null) {
      lastSeenRoundNumberRef.current = activeRound.roundNumber
      return
    }

    if (lastSeenRoundNumberRef.current === activeRound.roundNumber) {
      return
    }

    lastSeenRoundNumberRef.current = activeRound.roundNumber

    queueMicrotask(() => {
      setOptimisticOwnCardValue(null)
      setVoteError(null)
      setRevealError(null)
      setActiveFunEvent(null)
      setActiveRoundReaction(null)
    })
  }, [activeRound])

  useEffect(() => {
    if (
      !activeRound ||
      activeRound.status !== 'revealed' ||
      !locallyObservedRoundIdsRef.current.has(activeRound.id) ||
      isMilestoneRound ||
      roundReactionKind ||
      roomSettings?.funLevel !== 'chaotic'
    ) {
      return
    }

    const revealKey = `${activeRound.id}:${activeRound.roundNumber}`

    if (revealedFunRoundKeyRef.current === revealKey) {
      return
    }

    revealedFunRoundKeyRef.current = revealKey

    const quote = isConsensusCelebration
      ? consensusQuotes[activeRound.roundNumber % consensusQuotes.length]
      : revealQuotes[activeRound.roundNumber % revealQuotes.length]

    void broadcastFunEvent({
      caption: isConsensusCelebration ? consensusCaption : revealCaption,
      mode: isConsensusCelebration ? 'celebration' : 'chaos',
      quote,
    })
  }, [
    activeRound,
    isConsensusCelebration,
    isMilestoneRound,
    roomSettings?.funLevel,
    roundReactionKind,
  ])

  useEffect(() => {
    if (
      !activeRound ||
      activeRound.status !== 'revealed' ||
      !isMilestoneRound ||
      roomSettings?.funLevel !== 'chaotic'
    ) {
      return
    }

    const milestoneKey = `${activeRound.id}:${activeRound.roundNumber}`

    if (milestoneRoundKeyRef.current === milestoneKey) {
      return
    }

    milestoneRoundKeyRef.current = milestoneKey

    if (roundReactionTimeoutRef.current !== null) {
      window.clearTimeout(roundReactionTimeoutRef.current)
      roundReactionTimeoutRef.current = null
    }

    setActiveRoundReaction(null)

    void broadcastFunEvent({
      caption: milestoneCaption,
      mode: 'milestone',
    })
  }, [activeRound, isMilestoneRound, roomSettings?.funLevel])

  useEffect(() => {
    if (
      !activeRound ||
      activeRound.status !== 'revealed' ||
      !roundReactionKind ||
      isMilestoneRound ||
      !locallyObservedRoundIdsRef.current.has(activeRound.id) ||
      roomSettings?.funLevel !== 'chaotic'
    ) {
      return
    }

    const reactionKey = `${activeRound.id}:${activeRound.roundNumber}`

    if (roundReactionRoundKeyRef.current === reactionKey) {
      return
    }

    roundReactionRoundKeyRef.current = reactionKey

    if (roundReactionTimeoutRef.current !== null) {
      window.clearTimeout(roundReactionTimeoutRef.current)
    }

    if (funEventTimeoutRef.current !== null) {
      window.clearTimeout(funEventTimeoutRef.current)
      funEventTimeoutRef.current = null
    }

    setActiveFunEvent(null)
    setActiveRoundReaction(roundReactionKind)

    roundReactionTimeoutRef.current = window.setTimeout(() => {
      setActiveRoundReaction(null)
      roundReactionTimeoutRef.current = null
    }, 5000)
  }, [activeRound, isMilestoneRound, roomSettings?.funLevel, roundReactionKind])

  useEffect(() => {
    if (!room || !selfParticipant || !activeRound) {
      return
    }

    if (activeRound.status !== 'voting') {
      countdownAttemptRef.current = null
      return
    }

    if (!allVotersHaveSubmitted) {
      countdownAttemptRef.current = null
      return
    }

    const roundAttemptKey = `${activeRound.id}:${activeRound.roundNumber}`

    if (countdownAttemptRef.current === roundAttemptKey) {
      return
    }

    countdownAttemptRef.current = roundAttemptKey

    void startRevealCountdownEvent()
  }, [activeRound, allVotersHaveSubmitted, room, selfParticipant])

  useEffect(() => {
    if (
      !room ||
      !activeRound ||
      activeRound.status !== 'countdown' ||
      !activeRound.countdownStartedAt
    ) {
      return
    }

    const revealAt =
      new Date(activeRound.countdownStartedAt).getTime() +
      activeRound.countdownSeconds * 1000
    const timeoutId = window.setTimeout(
      () => {
        void finalizeRevealEvent()
      },
      Math.max(0, revealAt - Date.now())
    )

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [activeRound, room])

  async function handleVote(cardValue: string) {
    if (!room || !selfParticipant) {
      return
    }

    if (effectiveSelfRole !== 'voter') {
      setVoteError('Spectators cannot vote in this room.')
      return
    }

    setIsVoteSubmitting(true)
    setVoteError(null)
    setOptimisticOwnCardValue(cardValue)

    try {
      await submitVote({
        roomId: room.id,
        clientId: identity.clientId,
        cardValue,
      })
    } catch (error) {
      setOptimisticOwnCardValue(null)
      setVoteError(
        error instanceof Error ? error.message : 'Failed to submit vote.'
      )
    } finally {
      setIsVoteSubmitting(false)
    }
  }

  async function handleRevealCountdown() {
    if (!room || !selfParticipant) {
      return
    }

    setIsCountdownSubmitting(true)
    setRevealError(null)

    try {
      await startRevealCountdown({
        roomId: room.id,
        actorClientId: identity.clientId,
      })
    } catch (error) {
      setRevealError(
        error instanceof Error
          ? error.message
          : 'Failed to start reveal countdown.'
      )
      countdownAttemptRef.current = null
    } finally {
      setIsCountdownSubmitting(false)
    }
  }

  async function handleInstantReveal() {
    if (!room || !selfParticipant) {
      return
    }

    setIsRevealSubmitting(true)
    setRevealError(null)

    try {
      await revealRound({ roomId: room.id, actorClientId: identity.clientId })
    } catch (error) {
      setRevealError(
        error instanceof Error ? error.message : 'Failed to reveal votes.'
      )
    } finally {
      setIsRevealSubmitting(false)
    }
  }

  async function finalizeReveal() {
    if (!room || !selfParticipant) {
      return
    }

    try {
      await revealRound({ roomId: room.id, actorClientId: identity.clientId })
      setRevealError(null)
    } catch (error) {
      setRevealError(
        error instanceof Error ? error.message : 'Failed to reveal votes.'
      )
    }
  }

  async function handleDeliveryDrop() {
    if (!areFunEffectsEnabled || isDeliveryInProgress) {
      return
    }

    const deliveryEvent = {
      caption: deliveryCaption,
      mode: 'delivery',
    } satisfies RoomFunEvent

    showFunEvent(deliveryEvent)
    await sendFunEvent(deliveryEvent)
  }

  async function handleResetRound() {
    if (!room || !selfParticipant) {
      return
    }

    setIsResetSubmitting(true)
    setRevealError(null)

    try {
      await resetRound({
        roomId: room.id,
        actorClientId: identity.clientId,
      })
      setOptimisticOwnCardValue(null)
    } catch (error) {
      setRevealError(
        error instanceof Error ? error.message : 'Failed to reset the round.'
      )
    } finally {
      setIsResetSubmitting(false)
    }
  }

  async function handleFunLevelToggle() {
    if (!room || !selfParticipant || !roomSettings) {
      return
    }

    setIsFunLevelSaving(true)
    setSettingsError(null)

    try {
      await setRoomFunLevel({
        roomId: room.id,
        actorClientId: identity.clientId,
        nextFunLevel:
          roomSettings.funLevel === 'chaotic' ? 'disabled' : 'chaotic',
      })
    } catch (error) {
      setSettingsError(
        error instanceof Error ? error.message : 'Failed to update fun level.'
      )
    } finally {
      setIsFunLevelSaving(false)
    }
  }

  async function handleRoleChange(input: {
    participantId: string
    nextRole: 'voter' | 'spectator'
    isSelfTarget: boolean
  }) {
    if (!room) {
      return
    }

    setPendingParticipantActionId(input.participantId)
    setParticipantActionError(null)

    try {
      await setParticipantRole({
        roomId: room.id,
        actorClientId: identity.clientId,
        targetParticipantId: input.participantId,
        nextRole: input.nextRole,
      })

      if (input.isSelfTarget && input.nextRole === 'spectator') {
        setOptimisticOwnCardValue(null)
        setVoteError(null)
      }
    } catch (error) {
      setParticipantActionError(
        error instanceof Error
          ? error.message
          : 'Failed to change participant role.'
      )
    } finally {
      setPendingParticipantActionId(null)
    }
  }

  async function handleKick(
    targetParticipantId: string,
    isOwnerTarget: boolean
  ) {
    if (!room) {
      return
    }

    if (isOwnerTarget) {
      setParticipantActionError('Room owner cannot be removed.')
      return
    }

    setPendingParticipantActionId(targetParticipantId)
    setParticipantActionError(null)

    try {
      await kickParticipant({
        roomId: room.id,
        actorClientId: identity.clientId,
        targetParticipantId,
      })
    } catch (error) {
      setParticipantActionError(
        error instanceof Error ? error.message : 'Failed to kick participant.'
      )
    } finally {
      setPendingParticipantActionId(null)
    }
  }

  async function handleLeaveRoom(targetParticipantId: string) {
    if (!room) {
      return
    }

    if (isSelfRoomOwner) {
      setParticipantActionError(
        'Room owner cannot leave. Close the room instead.'
      )
      return
    }

    setPendingParticipantActionId(targetParticipantId)
    setParticipantActionError(null)

    try {
      await leaveRoom({
        roomId: room.id,
        actorClientId: identity.clientId,
      })

      resetForSelfLeave()
    } catch (error) {
      setParticipantActionError(
        error instanceof Error ? error.message : 'Failed to leave room.'
      )
    } finally {
      setPendingParticipantActionId(null)
    }
  }

  async function handleShutdownRoom() {
    if (!room || !selfParticipant || !isSelfRoomOwner) {
      return
    }

    setIsShutdownSubmitting(true)
    setSettingsError(null)
    setParticipantActionError(null)

    try {
      await shutdownRoom({
        roomId: room.id,
        actorClientId: identity.clientId,
      })

      clearActiveRoomName()
      setSelfParticipant(null)
      setIsShutdownConfirmOpen(false)
      navigate('/')
    } catch (error) {
      setSettingsError(
        error instanceof Error ? error.message : 'Failed to close room.'
      )
    } finally {
      setIsShutdownSubmitting(false)
    }
  }

  const scoreSummaryPanel = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-4 mb-4 min-h-[12rem] rounded-[18px] border-2 border-[var(--pep-accent-2)]/35 bg-[linear-gradient(135deg,_#fff7ce,_#ffffff_58%,_#d7f5eb)] p-4 shadow-[0_14px_34px_rgba(31,160,137,0.13)] sm:h-[12rem] sm:overflow-hidden"
    >
      {activeRound?.status === 'revealed' ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--pep-accent)]">
                Round {activeRound.roundNumber} results
              </p>
              <h4 className="mt-1 font-[var(--pep-font-display)] text-xl leading-none text-[var(--pep-ink)]">
                Score summary
              </h4>
            </div>
            <div className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-[var(--pep-ink)] shadow-[inset_0_0_0_1px_rgba(12,32,42,0.08)]">
              {scoreSummary.numericVoteCount} numeric vote
              {scoreSummary.numericVoteCount === 1 ? '' : 's'}
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="min-w-0 rounded-[14px] border border-[var(--pep-line)] bg-white/86 p-2.5">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--pep-accent)]">
                Average
              </p>
              <p className="mt-1 font-[var(--pep-font-display)] text-3xl leading-none text-[var(--pep-ink)]">
                {scoreSummary.averageLabel}
              </p>
            </div>
            <div className="min-w-0 rounded-[14px] border-2 border-[var(--pep-accent)]/25 bg-white p-2.5 shadow-[0_10px_24px_rgba(212,47,38,0.08)]">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--pep-accent)]">
                Recommended
              </p>
              <p className="mt-1 font-[var(--pep-font-display)] text-3xl leading-none text-[var(--pep-ink)]">
                {scoreSummary.recommendedLabel}
              </p>
            </div>
          </div>

          {isConsensusCelebration ? (
            <p className="mt-2 truncate rounded-full bg-[var(--pep-accent-2)]/14 px-3 py-1.5 text-xs font-black text-[var(--pep-accent-2)]">
              Everyone matched on the same estimate.
            </p>
          ) : null}
        </>
      ) : (
        <div className="flex h-full flex-col justify-center">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--pep-accent)]">
            Round results
          </p>
          <h4 className="mt-1 font-[var(--pep-font-display)] text-xl text-[var(--pep-ink)]">
            Waiting for reveal
          </h4>
          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--pep-ink-soft)]">
            Score summary will appear here after the round is revealed.
          </p>
        </div>
      )}
    </motion.div>
  )

  const votingControls = (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[var(--pep-line)] bg-white/82 px-4 py-3">
        <div>
          <p className="text-xs font-black uppercase text-[var(--pep-accent)]">
            Vote
          </p>
          <p className="mt-1 text-base leading-6 text-[var(--pep-ink-soft)]">
            Pick a card. Votes stay hidden until reveal.
          </p>
        </div>
        <div className="rounded-full bg-[var(--pep-panel-strong)] px-3 py-2 text-sm font-black uppercase text-[var(--pep-ink)]">
          {displayedOwnCardValue
            ? `Your vote: ${getCardDisplayLabel(displayedOwnCardValue)}`
            : 'No vote selected'}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 xl:grid-cols-6">
        {fibonacciDeck.map((card, index) => {
          const isSelected = displayedOwnCardValue === card
          const imageCardPath =
            card === 'nibbler'
              ? '/cards/icons8-nibbler.png'
              : card === 'ship'
                ? '/planet-express-ship.png'
                : card === 'BIG'
                  ? '/cards/icons8-lrrr.png'
                  : card === 'coffee'
                    ? '/cards/coffee-cup.svg'
                    : null
          const cardLabel = getCardDisplayLabel(card)
          const cardMeaningLabel = getCardMeaningLabel(card)

          return (
            <motion.div
              key={card}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: index * 0.025 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="h-24 sm:h-28"
            >
              <button
                type="button"
                aria-label={
                  cardMeaningLabel
                    ? `${cardLabel} card, ${cardMeaningLabel}`
                    : `${cardLabel} card`
                }
                onClick={() => void handleVote(card)}
                disabled={
                  !isJoinedToRoom ||
                  effectiveSelfRole !== 'voter' ||
                  isVoteSubmitting ||
                  activeRound?.status !== 'voting'
                }
                className={[
                  'relative flex h-full w-full flex-col justify-between rounded-[12px] border p-3 text-left shadow-[0_8px_18px_rgba(12,32,42,0.07)] transition',
                  isSelected
                    ? 'border-[var(--pep-accent)] bg-[linear-gradient(180deg,_#fff0b8,_#f4d44f)] ring-2 ring-[var(--pep-accent)]/20'
                    : 'border-[var(--pep-line-strong)] bg-[linear-gradient(180deg,_#ffffff,_#dff7ef)] hover:border-[var(--pep-accent-2)]',
                ].join(' ')}
              >
                <span className="text-[10px] font-black uppercase text-[var(--pep-ink-soft)]">
                  Card
                </span>
                {imageCardPath ? (
                  <span className="flex min-h-14 items-center justify-center sm:min-h-16">
                    <img
                      src={imageCardPath}
                      alt={cardLabel}
                      className={[
                        'object-contain',
                        card === 'ship'
                          ? 'max-h-14 w-32 sm:max-h-16 sm:w-40'
                          : card === 'BIG'
                            ? 'max-h-20 sm:max-h-24'
                            : card === 'coffee'
                              ? 'max-h-20 sm:max-h-24'
                              : 'max-h-16 sm:max-h-20',
                      ].join(' ')}
                    />
                  </span>
                ) : (
                  <span className="font-[var(--pep-font-display)] text-3xl leading-none text-[var(--pep-ink)] sm:text-4xl">
                    {cardLabel}
                  </span>
                )}
                {cardMeaningLabel ? (
                  <span
                    className={[
                      'absolute right-3 font-black uppercase leading-none tracking-[0.06em] text-black',
                      card === 'ship'
                        ? 'top-0.5 text-2xl sm:top-1 sm:text-3xl'
                        : 'top-2 text-base',
                    ].join(' ')}
                  >
                    {cardMeaningLabel}
                  </span>
                ) : null}
              </button>
            </motion.div>
          )
        })}
      </div>
    </>
  )

  const activeRoundReactionDisplay =
    activeRoundReaction !== null
      ? roundReactionConfig[activeRoundReaction]
      : null
  const activeRoomName = readActiveRoomName()
  const hasStoredAutoJoinTarget = Boolean(
    identity.displayName.trim() &&
    activeRoomName === (room?.name ?? normalizedRoomName)
  )
  const shouldDeferJoinModal =
    !isJoinedToRoom &&
    (isRoomLoading ||
      isJoining ||
      (hasStoredAutoJoinTarget && !autoJoinAttemptedRef.current))
  const shouldShowJoinModal = !isJoinedToRoom && !shouldDeferJoinModal
  const joinModal = shouldShowJoinModal ? (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(20,38,51,0.5)] px-4 py-6 backdrop-blur-sm">
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-room-title"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-[22px] border-2 border-[var(--pep-ink)] bg-[linear-gradient(160deg,_#ffffff,_#dff7ef)] p-5 shadow-[0_26px_70px_rgba(12,32,42,0.28)]"
      >
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[14px] border border-[var(--pep-line)] bg-white shadow-[0_12px_26px_rgba(12,32,42,0.12)]">
            <img
              src="/planet-express-logo.png"
              alt="Planet Express logo"
              className="h-12 w-12 object-contain"
            />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--pep-accent)]">
              Join room
            </p>
            <h2
              id="join-room-title"
              className="mt-1 font-[var(--pep-font-display)] text-4xl leading-none text-[var(--pep-ink)]"
            >
              {normalizedRoomName || 'Room'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--pep-ink-soft)]">
              Enter your name and choose an avatar before viewing the room.
            </p>
          </div>
        </div>

        {roomError ? (
          <p className="mt-4 rounded-2xl border border-[var(--pep-accent)]/20 bg-[var(--pep-accent)]/10 px-4 py-3 text-sm font-medium text-[var(--pep-accent)]">
            {roomError}
          </p>
        ) : null}

        {joinError || voteError ? (
          <p className="mt-4 rounded-2xl border border-[var(--pep-accent)]/20 bg-[var(--pep-accent)]/10 px-4 py-3 text-sm font-medium text-[var(--pep-accent)]">
            {joinError ?? voteError}
          </p>
        ) : null}

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-xs font-black uppercase text-[var(--pep-ink-soft)]">
              Display name
            </span>
            <input
              value={displayName}
              onChange={(event) =>
                setDisplayName(
                  event.target.value.slice(0, maxDisplayNameLength)
                )
              }
              disabled={isJoining || isRoomLoading}
              maxLength={maxDisplayNameLength}
              placeholder="Hermes"
              className="mt-1.5 w-full rounded-[12px] border border-[var(--pep-line-strong)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--pep-accent-2)] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <div>
            <span className="text-xs font-black uppercase text-[var(--pep-ink-soft)]">
              Avatar
            </span>
            <div className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-8">
              {avatarOptions.map((avatarOption) => {
                const isSelected = avatarOption.key === avatarKey

                return (
                  <button
                    key={avatarOption.key}
                    type="button"
                    aria-label={`Use ${avatarOption.label} avatar`}
                    onClick={() => setAvatarKey(avatarOption.key)}
                    disabled={isJoining || isRoomLoading}
                    title={avatarOption.label}
                    className={[
                      'grid aspect-square place-items-center rounded-[12px] border p-1.5 transition',
                      isSelected
                        ? 'border-[var(--pep-accent)] bg-white shadow-[0_10px_24px_rgba(212,47,38,0.12)] ring-2 ring-[var(--pep-accent)]/12'
                        : 'border-[var(--pep-line)] bg-white/72 hover:border-[var(--pep-line-strong)]',
                    ].join(' ')}
                  >
                    <span
                      className={`grid h-full w-full overflow-hidden rounded-[10px] bg-gradient-to-br ${avatarOption.accentClassName} shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]`}
                    >
                      <img
                        src={avatarOption.portraitPath}
                        alt={avatarOption.label}
                        className={getAvatarPortraitClassName(avatarOption)}
                      />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleJoin()}
            disabled={
              isJoining || isRoomLoading || !displayName.trim() || !room
            }
            className="w-full rounded-[14px] border-2 border-[var(--pep-ink)] bg-[var(--pep-accent)] px-5 py-3 text-sm font-black uppercase text-white shadow-[0_8px_0_rgba(20,38,51,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
          >
            {isJoining
              ? 'Joining...'
              : isRoomLoading
                ? 'Opening room...'
                : 'Join room'}
          </button>
        </div>
      </motion.section>
    </div>
  ) : null

  const participantPanel = (
    <div className="rounded-[16px] border border-[var(--pep-line)] bg-white/90 p-3 shadow-[0_14px_38px_rgba(12,32,42,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-black uppercase text-[var(--pep-accent)]">
            Participants
          </p>
          <h3 className="mt-1 font-[var(--pep-font-display)] text-xl text-[var(--pep-ink)]">
            In the room
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex min-h-9 items-center rounded-[10px] border border-[var(--pep-line)] bg-[var(--pep-panel-strong)] px-3 py-2 text-xs font-black uppercase leading-none text-[var(--pep-ink)]">
            {participants.length} people
          </div>
          <div className="inline-flex min-h-9 items-center rounded-[10px] bg-emerald-50 px-3 py-2 text-xs font-black uppercase leading-none text-emerald-700">
            {Object.keys(presenceByParticipantId).length} online
          </div>
        </div>
      </div>

      {participants.length === 0 && !isRoomLoading ? (
        <div className="mt-3 rounded-[12px] border border-dashed border-[var(--pep-line-strong)] bg-white/70 px-4 py-4 text-center text-sm leading-6 text-[var(--pep-ink-soft)]">
          No participants yet.
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(13rem,13rem))] gap-2.5">
        {participants.map((participant, index) => {
          const avatar = getAvatarOption(participant.avatarKey)
          const isOnline = Boolean(presenceByParticipantId[participant.id])
          const isSelf = participant.id === selfParticipant?.participantId
          const isRoomOwner = participant.id === roomOwnerParticipantId
          const hasSubmittedVote =
            submittedVoteParticipantIds.has(participant.id) ||
            (isSelf && Boolean(displayedOwnCardValue))
          const revealedCardValue = revealedVoteByParticipantId.get(
            participant.id
          )
          const nextRole = participant.role === 'voter' ? 'spectator' : 'voter'
          const isParticipantActionPending =
            pendingParticipantActionId === participant.id

          return (
            <motion.article
              key={participant.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: index * 0.03 }}
              className="relative min-w-0 overflow-hidden rounded-[12px] border border-[var(--pep-line)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.86),_rgba(238,245,243,0.92))] p-2.5 shadow-[0_8px_20px_rgba(12,32,42,0.05)]"
            >
              <div className="flex items-start gap-2">
                <div
                  className={`grid h-9 w-9 shrink-0 overflow-hidden rounded-[9px] bg-gradient-to-br ${avatar.accentClassName} shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]`}
                >
                  <img
                    src={avatar.portraitPath}
                    alt={avatar.label}
                    className={getAvatarPortraitClassName(avatar)}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="min-h-[3.6rem]">
                    <h4 className="truncate text-sm font-black text-[var(--pep-ink)]">
                      {participant.displayName}
                    </h4>
                    <p className="mt-0.5 truncate text-xs text-[var(--pep-ink-soft)]">
                      {avatar.label}
                    </p>
                    <div className="mt-1 flex h-4 items-center gap-1.5">
                      {isRoomOwner ? (
                        <span className="rounded-full bg-[var(--pep-panel-strong)] px-1.5 py-0.5 text-[9px] font-black uppercase leading-none text-[var(--pep-ink)]">
                          Owner
                        </span>
                      ) : null}
                      {isSelf ? (
                        <span className="rounded-full bg-[var(--pep-accent)]/10 px-1.5 py-0.5 text-[9px] font-black uppercase leading-none text-[var(--pep-accent)]">
                          You
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p
                    className={[
                      'mt-1 flex min-h-9 items-center justify-center truncate rounded-[10px] border px-2 py-1 text-center font-black uppercase leading-none',
                      activeRound?.status === 'revealed'
                        ? revealedCardValue
                          ? 'border-[var(--pep-ink)] bg-[var(--pep-yellow)] text-xl text-[var(--pep-ink)] shadow-[0_5px_0_rgba(20,38,51,0.14)]'
                          : 'border-slate-300 bg-slate-100 text-sm text-slate-500'
                        : 'border-transparent bg-transparent text-transparent',
                    ].join(' ')}
                  >
                    {activeRound?.status === 'revealed'
                      ? revealedCardValue
                        ? getCardDisplayLabel(revealedCardValue)
                        : 'No vote'
                      : ''}
                  </p>
                  <div className="mt-2 flex flex-col items-start gap-1 pr-11">
                    <span
                      className={[
                        'whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.06em]',
                        participant.role === 'voter'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-200 text-slate-700',
                      ].join(' ')}
                    >
                      {participant.role}
                    </span>
                    <span
                      className={[
                        'whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.06em]',
                        isOnline
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700',
                      ].join(' ')}
                    >
                      {isOnline ? 'online' : 'offline'}
                    </span>
                  </div>
                  {isJoinedToRoom ? (
                    <div className="mt-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label={`Switch ${participant.displayName} to ${nextRole} mode`}
                        title={`Switch ${participant.displayName} to ${nextRole} mode`}
                        onClick={() =>
                          void handleRoleChange({
                            participantId: participant.id,
                            nextRole,
                            isSelfTarget: isSelf,
                          })
                        }
                        disabled={isParticipantActionPending}
                        className={[
                          'grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition hover:-translate-y-0.5 disabled:cursor-default disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none',
                          nextRole === 'spectator'
                            ? 'border-[var(--pep-line-strong)] bg-white text-[var(--pep-ink)] shadow-[0_5px_12px_rgba(12,32,42,0.08)]'
                            : 'border-[var(--pep-accent-2)] bg-[var(--pep-accent-2)] text-white shadow-[0_5px_12px_rgba(31,152,134,0.18)]',
                        ].join(' ')}
                      >
                        {isParticipantActionPending ? (
                          <SpinnerIcon />
                        ) : (
                          <EyeIcon crossed={nextRole === 'spectator'} />
                        )}
                      </button>
                      {isSelf && !isRoomOwner ? (
                        <button
                          type="button"
                          aria-label="Leave room"
                          title="Leave room"
                          onClick={() => void handleLeaveRoom(participant.id)}
                          disabled={isParticipantActionPending}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-[var(--pep-line-strong)] bg-white text-[var(--pep-ink)] shadow-[0_5px_12px_rgba(12,32,42,0.08)] transition hover:-translate-y-0.5 disabled:cursor-default disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                        >
                          {isParticipantActionPending ? (
                            <SpinnerIcon />
                          ) : (
                            <LeaveIcon />
                          )}
                        </button>
                      ) : isRoomOwner ? (
                        <span
                          aria-label="Room owner cannot be kicked"
                          title="Room owner cannot be kicked"
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-slate-300 bg-slate-100 text-slate-500"
                        >
                          <ShieldIcon />
                        </span>
                      ) : (
                        <button
                          type="button"
                          aria-label={`Kick ${participant.displayName}`}
                          title={`Kick ${participant.displayName}`}
                          onClick={() =>
                            void handleKick(participant.id, isRoomOwner)
                          }
                          disabled={isParticipantActionPending}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-[var(--pep-accent)] bg-white text-[var(--pep-accent)] shadow-[0_5px_12px_rgba(212,47,38,0.14)] transition hover:-translate-y-0.5 disabled:cursor-default disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                        >
                          {isParticipantActionPending ? (
                            <SpinnerIcon />
                          ) : (
                            <KickIcon />
                          )}
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
              <div
                title={hasSubmittedVote ? 'Vote submitted' : 'Waiting for vote'}
                aria-label={
                  hasSubmittedVote ? 'Vote submitted' : 'Waiting for vote'
                }
                className={[
                  'absolute bottom-2.5 right-2.5 grid h-9 w-9 place-items-center rounded-full border-2 transition',
                  hasSubmittedVote
                    ? 'border-[var(--pep-accent-2)] bg-[var(--pep-accent-2)] text-white shadow-[0_8px_16px_rgba(31,152,134,0.22)]'
                    : 'border-slate-300 bg-slate-100 text-slate-400',
                ].join(' ')}
              >
                <CheckIcon />
              </div>
            </motion.article>
          )
        })}
      </div>
    </div>
  )

  const shutdownConfirmDialog = isShutdownConfirmOpen ? (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[radial-gradient(circle_at_top,_rgba(245,212,79,0.28),_rgba(12,32,42,0.74)_48%,_rgba(12,32,42,0.86))] px-4 py-8 backdrop-blur-sm">
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shutdown-room-title"
        className="relative w-full max-w-md overflow-hidden rounded-[24px] border-2 border-[var(--pep-ink)] bg-[linear-gradient(160deg,_#fff7ce,_#ffffff_55%,_#c8efe5)] p-5 shadow-[0_28px_80px_rgba(12,32,42,0.34)]"
      >
        <div className="pointer-events-none absolute -right-8 -top-5 opacity-20">
          <img
            src="/planet-express-ship.png"
            alt=""
            className="h-24 w-52 object-contain"
          />
        </div>
        <div className="relative flex items-start gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[16px] border-2 border-[var(--pep-ink)] bg-white shadow-[0_8px_0_rgba(20,38,51,0.12)]">
            <img
              src="/planet-express-logo.png"
              alt=""
              className="h-11 w-11 object-contain"
            />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--pep-accent)]">
              Permanent action
            </p>
            <h2
              id="shutdown-room-title"
              className="mt-1 font-[var(--pep-font-display)] text-3xl leading-none text-[var(--pep-ink)]"
            >
              Close this room?
            </h2>
          </div>
        </div>
        <div className="relative mt-4 rounded-[16px] border border-[var(--pep-accent)]/25 bg-white/82 p-4">
          <p className="text-sm font-semibold leading-6 text-[var(--pep-ink)]">
            This permanently deletes this room and all saved participants,
            votes, rounds, and settings.
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--pep-ink-soft)]">
            This cannot be undone.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsShutdownConfirmOpen(false)}
            disabled={isShutdownSubmitting}
            className="rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-4 py-2.5 text-sm font-black uppercase text-[var(--pep-ink)] transition hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleShutdownRoom()}
            disabled={!canShutdownRoom}
            className={[
              'rounded-[10px] border-2 px-4 py-2.5 text-sm font-black uppercase transition',
              canShutdownRoom
                ? 'cursor-pointer border-[var(--pep-ink)] bg-[var(--pep-accent)] text-white shadow-[0_8px_0_rgba(20,38,51,0.22)] hover:-translate-y-0.5'
                : 'cursor-default border-slate-300 bg-slate-100 text-slate-400 shadow-none',
            ].join(' ')}
          >
            {isShutdownSubmitting ? 'Closing...' : 'Close room'}
          </button>
        </div>
      </motion.section>
    </div>
  ) : null

  return (
    <div className="space-y-4">
      <FunLayer event={activeFunEvent} reaction={activeRoundReactionDisplay} />
      <div
        aria-hidden={shouldShowJoinModal}
        className={[
          'space-y-4 transition',
          shouldShowJoinModal
            ? 'pointer-events-none select-none opacity-45 blur-[2px]'
            : '',
        ].join(' ')}
      >
        {participantPanel}

        <div className="grid gap-5 lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)]">
          <section className="min-w-0 flex flex-col gap-5">
            <div
              className={[
                'rounded-[16px] border border-[var(--pep-line)] bg-white/84 p-5 shadow-[0_14px_38px_rgba(12,32,42,0.08)]',
                isJoinedToRoom ? 'order-1' : 'order-2',
              ].join(' ')}
            >
              <p className="text-xs font-black uppercase text-[var(--pep-accent)]">
                Room
              </p>
              <h2 className="mt-2 font-[var(--pep-font-display)] text-4xl leading-none text-[var(--pep-ink)]">
                {normalizedRoomName || 'Unknown room'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--pep-ink-soft)]">
                Join, copy the link, and start estimating.
              </p>

              {isJoinedToRoom && areFunEffectsEnabled ? (
                <button
                  type="button"
                  disabled={isDeliveryInProgress}
                  onClick={() => void handleDeliveryDrop()}
                  className="mt-4 flex w-full items-center justify-between gap-3 rounded-[14px] border border-[var(--pep-accent-2)]/35 bg-[linear-gradient(135deg,_#caf6e9,_#fff5b2)] px-4 py-3 text-left text-sm font-black uppercase tracking-[0.08em] text-[var(--pep-ink)] shadow-[0_12px_24px_rgba(31,160,137,0.16)] transition hover:-translate-y-0.5 disabled:cursor-default disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-600 disabled:shadow-none disabled:hover:translate-y-0"
                >
                  <span>
                    {isDeliveryInProgress
                      ? 'Delivery in progress'
                      : 'Request Planet Express delivery'}
                  </span>
                  <img
                    src="/planet-express-ship.png"
                    alt=""
                    className="h-8 w-20 shrink-0 object-contain"
                  />
                </button>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-3 py-2 text-sm font-semibold text-[var(--pep-ink)] transition hover:-translate-y-0.5"
                >
                  Copy invite link
                </button>
                <button
                  type="button"
                  onClick={() => void handleFunLevelToggle()}
                  disabled={
                    !isJoinedToRoom || !roomSettings || isFunLevelSaving
                  }
                  className={[
                    'rounded-[10px] px-3 py-2 text-xs font-black uppercase transition',
                    roomSettings?.funLevel === 'chaotic'
                      ? 'bg-[var(--pep-accent)] text-white shadow-[0_10px_22px_rgba(212,47,38,0.24)]'
                      : 'border border-[var(--pep-line-strong)] bg-white text-[var(--pep-ink)]',
                  ].join(' ')}
                >
                  {isFunLevelSaving
                    ? 'Saving...'
                    : roomSettings?.funLevel === 'chaotic'
                      ? 'Effects: on'
                      : 'Effects: off'}
                </button>
                {isSelfRoomOwner ? (
                  <button
                    type="button"
                    onClick={() => setIsShutdownConfirmOpen(true)}
                    disabled={!canShutdownRoom}
                    className={[
                      'rounded-[10px] border px-3 py-2 text-xs font-black uppercase transition',
                      canShutdownRoom
                        ? 'cursor-pointer border-[var(--pep-accent)] bg-white text-[var(--pep-accent)] shadow-[0_8px_18px_rgba(212,47,38,0.12)] hover:-translate-y-0.5'
                        : 'cursor-default border-slate-300 bg-slate-100 text-slate-400 shadow-none',
                    ].join(' ')}
                  >
                    {isShutdownSubmitting ? 'Closing...' : 'Close room'}
                  </button>
                ) : null}
              </div>

              {inviteState === 'copied' ? (
                <p className="mt-3 text-sm font-semibold text-[var(--pep-accent-2)]">
                  Invite link copied.
                </p>
              ) : null}

              {inviteState === 'failed' ? (
                <p className="mt-3 text-sm font-semibold text-[var(--pep-accent)]">
                  Copy failed. Use the browser address bar for now.
                </p>
              ) : null}

              {settingsError || roomSettingsErrorMessage ? (
                <p className="mt-3 text-sm font-semibold text-[var(--pep-accent)]">
                  {settingsError ?? roomSettingsErrorMessage}
                </p>
              ) : roomSettings ? (
                <p className="mt-4 text-sm text-[var(--pep-ink-soft)]">
                  Effects are{' '}
                  <span className="font-black text-[var(--pep-ink)]">
                    {roomSettings.funLevel === 'chaotic'
                      ? 'enabled'
                      : 'disabled'}
                  </span>
                  .
                </p>
              ) : null}
            </div>

            {isJoinedToRoom ? (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="order-2 rounded-[16px] border border-[var(--pep-line)] bg-white/86 p-4 shadow-[0_14px_38px_rgba(12,32,42,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase text-[var(--pep-accent)]">
                      Join
                    </p>
                    <h3 className="mt-2 font-[var(--pep-font-display)] text-xl text-[var(--pep-ink)] sm:text-2xl">
                      {isJoinedToRoom && selfParticipant
                        ? selfParticipant.displayName
                        : 'Choose a name and avatar'}
                    </h3>
                  </div>

                  {isJoinedToRoom ? (
                    <div className="rounded-[10px] bg-[var(--pep-accent-2)] px-3 py-2 text-xs font-black uppercase text-white">
                      Connected
                    </div>
                  ) : null}
                </div>

                {roomError ? (
                  <p className="mt-4 rounded-2xl border border-[var(--pep-accent)]/20 bg-[var(--pep-accent)]/10 px-4 py-3 text-sm font-medium text-[var(--pep-accent)]">
                    {roomError}
                  </p>
                ) : null}

                {joinError ? (
                  <p className="mt-4 rounded-2xl border border-[var(--pep-accent)]/20 bg-[var(--pep-accent)]/10 px-4 py-3 text-sm font-medium text-[var(--pep-accent)]">
                    {joinError}
                  </p>
                ) : null}

                {voteError ? (
                  <p className="mt-4 rounded-2xl border border-[var(--pep-accent)]/20 bg-[var(--pep-accent)]/10 px-4 py-3 text-sm font-medium text-[var(--pep-accent)]">
                    {voteError}
                  </p>
                ) : null}

                {revealError ? (
                  <p className="mt-4 rounded-2xl border border-[var(--pep-accent)]/20 bg-[var(--pep-accent)]/10 px-4 py-3 text-sm font-medium text-[var(--pep-accent)]">
                    {revealError}
                  </p>
                ) : null}

                {participantActionError ? (
                  <p className="mt-4 rounded-2xl border border-[var(--pep-accent)]/20 bg-[var(--pep-accent)]/10 px-4 py-3 text-sm font-medium text-[var(--pep-accent)]">
                    {participantActionError}
                  </p>
                ) : null}

                <div className="mt-3 space-y-2.5">
                  <label className="block">
                    <span className="text-xs font-black uppercase text-[var(--pep-ink-soft)]">
                      Display name
                    </span>
                    <input
                      value={displayName}
                      onChange={(event) =>
                        setDisplayName(
                          event.target.value.slice(0, maxDisplayNameLength)
                        )
                      }
                      disabled={isJoining || isRoomLoading}
                      maxLength={maxDisplayNameLength}
                      placeholder="Hermes"
                      className="mt-1.5 w-full rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-3 py-2.5 outline-none transition focus:border-[var(--pep-accent-2)] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </label>

                  <div>
                    <span className="text-xs font-black uppercase text-[var(--pep-ink-soft)]">
                      Avatar
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {avatarOptions.map((avatarOption) => {
                        const isSelected = avatarOption.key === avatarKey

                        return (
                          <button
                            key={avatarOption.key}
                            type="button"
                            aria-label={`Use ${avatarOption.label} avatar`}
                            onClick={() => setAvatarKey(avatarOption.key)}
                            disabled={isJoining || isRoomLoading}
                            title={avatarOption.label}
                            className={[
                              'grid h-11 w-11 place-items-center rounded-[10px] border p-1 transition',
                              isSelected
                                ? 'border-[var(--pep-accent)] bg-white shadow-[0_10px_24px_rgba(212,47,38,0.12)] ring-2 ring-[var(--pep-accent)]/12'
                                : 'border-[var(--pep-line)] bg-white/72 hover:border-[var(--pep-line-strong)]',
                            ].join(' ')}
                          >
                            <span
                              className={`grid h-full w-full overflow-hidden rounded-[8px] bg-gradient-to-br ${avatarOption.accentClassName} shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]`}
                            >
                              <img
                                src={avatarOption.portraitPath}
                                alt={avatarOption.label}
                                className={getAvatarPortraitClassName(
                                  avatarOption
                                )}
                              />
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleJoin()}
                    disabled={
                      isJoining || isRoomLoading || !displayName.trim() || !room
                    }
                    className="rounded-[10px] bg-[var(--pep-accent)] px-4 py-2.5 text-sm font-black uppercase text-white shadow-[0_10px_24px_rgba(212,47,38,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isJoining
                      ? 'Joining...'
                      : isJoinedToRoom
                        ? 'Update profile'
                        : 'Join room'}
                  </button>
                </div>
              </motion.div>
            ) : null}
          </section>

          <section className="min-w-0 overflow-hidden rounded-[16px] border border-[var(--pep-line)] bg-[linear-gradient(160deg,_rgba(255,255,255,0.92),_rgba(200,239,229,0.86))] p-5 shadow-[0_16px_42px_rgba(12,32,42,0.09)]">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-[var(--pep-accent)]">
                  Round
                </p>
                <h3 className="mt-2 font-[var(--pep-font-display)] text-3xl text-[var(--pep-ink)]">
                  Current estimate
                </h3>
              </div>
              <div className="inline-flex min-h-9 items-center rounded-[10px] border border-[var(--pep-line)] bg-white/70 px-3 py-2 text-xs font-semibold uppercase leading-none text-[var(--pep-ink-soft)]">
                Round {activeRound?.roundNumber ?? '-'}
              </div>
            </div>

            <div className="mb-4 grid gap-4 rounded-[14px] border border-[var(--pep-line)] bg-white/82 px-4 py-3 xl:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-black uppercase text-[var(--pep-accent)]">
                  Reveal
                </p>
                <p className="mt-1 max-w-2xl text-base leading-6 text-[var(--pep-ink-soft)]">
                  Any participant can reveal. Auto reveal starts when all votes
                  are in.
                </p>
                <p className="mt-2 text-sm font-black uppercase tracking-[0.08em] text-[var(--pep-ink-soft)]">
                  Status:{' '}
                  <span className="text-[var(--pep-ink)]">
                    {activeRound?.status === 'countdown' &&
                    countdownSecondsRemaining !== null
                      ? `reveal in ${countdownSecondsRemaining}`
                      : (activeRound?.status ?? 'loading')}
                  </span>
                </p>
              </div>
              <div className="grid w-full gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => void handleInstantReveal()}
                  disabled={!canReveal}
                  className={[
                    'min-h-12 rounded-[12px] border-2 px-4 py-2 text-xs font-black uppercase transition sm:text-sm',
                    canReveal
                      ? 'cursor-pointer border-[var(--pep-ink)] bg-[var(--pep-accent)] text-white shadow-[0_8px_0_rgba(20,38,51,0.24)] hover:-translate-y-0.5 hover:shadow-[0_10px_0_rgba(20,38,51,0.22)]'
                      : 'cursor-default border-slate-300 bg-slate-100 text-slate-400 shadow-none',
                  ].join(' ')}
                >
                  {isRevealSubmitting ? 'Revealing...' : 'Reveal'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleRevealCountdown()}
                  disabled={!canStartCountdown}
                  className={[
                    'min-h-12 rounded-[12px] border-2 px-4 py-2 text-xs font-black uppercase transition sm:text-sm',
                    canStartCountdown
                      ? 'cursor-pointer border-[var(--pep-ink)] bg-[var(--pep-yellow)] text-[var(--pep-ink)] shadow-[0_8px_0_rgba(20,38,51,0.18)] hover:-translate-y-0.5 hover:shadow-[0_10px_0_rgba(20,38,51,0.16)]'
                      : 'cursor-default border-slate-300 bg-slate-100 text-slate-400 shadow-none',
                  ].join(' ')}
                >
                  {isCountdownSubmitting ? 'Starting...' : 'Countdown'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleResetRound()}
                  disabled={!canResetRound}
                  className={[
                    'min-h-12 rounded-[12px] border-2 px-4 py-2 text-xs font-black uppercase transition sm:text-sm',
                    canResetRound
                      ? 'cursor-pointer border-[var(--pep-ink)] bg-[var(--pep-accent-2)] text-white shadow-[0_8px_0_rgba(20,38,51,0.24)] ring-4 ring-[var(--pep-yellow)]/35 hover:-translate-y-0.5 hover:shadow-[0_10px_0_rgba(20,38,51,0.2)]'
                      : 'cursor-default border-slate-300 bg-slate-100 text-slate-400 shadow-none',
                  ].join(' ')}
                >
                  {isResetSubmitting ? 'Resetting...' : 'Next round'}
                </button>
              </div>
            </div>

            {votingControls}

            {scoreSummaryPanel}

            {isRoomLoading ? (
              <p className="rounded-2xl border border-[var(--pep-line)] bg-white/75 px-4 py-3 text-sm text-[var(--pep-ink-soft)]">
                Opening room...
              </p>
            ) : null}

            {errorMessage ? (
              <p className="mb-4 rounded-2xl border border-[var(--pep-accent)]/20 bg-[var(--pep-accent)]/10 px-4 py-3 text-sm font-medium text-[var(--pep-accent)]">
                {errorMessage}
              </p>
            ) : null}

            {votingErrorMessage ? (
              <p className="mb-4 rounded-2xl border border-[var(--pep-accent)]/20 bg-[var(--pep-accent)]/10 px-4 py-3 text-sm font-medium text-[var(--pep-accent)]">
                {votingErrorMessage}
              </p>
            ) : null}
          </section>
        </div>
      </div>
      {joinModal}
      {shutdownConfirmDialog}
    </div>
  )
}

function EyeIcon({ crossed = false }: { crossed?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.7" />
      {crossed ? <path d="m4 20 16-16" /> : null}
    </svg>
  )
}

function KickIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 5h9v14H5z" />
      <path d="M14 12h7" />
      <path d="m18 9 3 3-3 3" />
      <path d="M8 12h.01" />
    </svg>
  )
}

function LeaveIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 5h5v14h-5" />
      <path d="M10 17 5 12l5-5" />
      <path d="M5 12h11" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 20 6v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  )
}

function getRoundReactionKind(
  cardValues: string[],
  hasMatchingNumericVotes: boolean,
  roundId: string
): RoundReactionKind | null {
  const reactionSeed = `${roundId}:${cardValues.slice().sort().join('|')}`

  if (cardValues.includes('coffee')) {
    return pickDeterministicItem(coffeeReactionKinds, reactionSeed)
  }

  if (cardValues.includes('nibbler')) {
    return 'nibblerQuestion'
  }

  if (cardValues.includes('ship')) {
    return 'shipInfinity'
  }

  if (cardValues.includes('BIG')) {
    return 'skepticalFry'
  }

  if (hasMatchingNumericVotes) {
    return pickDeterministicItem(consensusReactionKinds, reactionSeed)
  }

  const numericCardIndexes = cardValues
    .map((cardValue) =>
      numericCardIndexByValue.get(
        cardValue as (typeof numericCardValues)[number]
      )
    )
    .filter((cardIndex): cardIndex is number => cardIndex !== undefined)

  if (numericCardIndexes.length < 2) {
    return null
  }

  const lowestCardIndex = Math.min(...numericCardIndexes)
  const highestCardIndex = Math.max(...numericCardIndexes)

  return highestCardIndex - lowestCardIndex > 1
    ? pickDeterministicItem(wideSpreadReactionKinds, reactionSeed)
    : null
}

function pickDeterministicItem<const T extends readonly RoundReactionKind[]>(
  items: T,
  seed: string
): T[number] {
  return items[getDeterministicIndex(seed, items.length)]
}

function getDeterministicIndex(seed: string, itemCount: number) {
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }

  return hash % itemCount
}

function hasNumericConsensus(cardValues: string[]) {
  const numericCardVotes = cardValues.filter((cardValue) =>
    numericCardIndexByValue.has(cardValue as (typeof numericCardValues)[number])
  )

  return (
    numericCardVotes.length >= 2 &&
    numericCardVotes.every((cardValue) => cardValue === numericCardVotes[0])
  )
}

function SpinnerIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-85"
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
