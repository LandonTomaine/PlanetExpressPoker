import { motion } from 'motion/react'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
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
  saveRoomNamePrefill,
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
  startRevealCountdown,
  submitVote,
  triggerHypnotoadEasterEgg,
} from '../features/room/data/roomApi'
import { FunLayer } from '../features/room/FunLayer'
import {
  consensusCaption,
  deliveryCaption,
  deliveryStormCaption,
  hypnotoadCaption,
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
import {
  getRoomNameError,
  maxRoomNameLength,
  normalizeRoomName,
} from '../features/room/roomName'
import { buildScoreSummary } from '../features/room/summary'
import {
  fibonacciDeck,
  getCardArtworkLabel,
  getCardDisplayLabel,
  getCardMeaningLabel,
  numericCardValues,
} from '../features/room/voting'
import type {
  JoinedParticipant,
  Participant,
  ParticipantRole,
  PresenceParticipant,
  Room,
  RoundReactionKind,
} from '../features/room/types'

type RoundReactionCategory =
  | 'allSpecialCards'
  | 'coffee'
  | 'consensus'
  | 'fibonacciSpread'
  | 'nibblerQuestion'
  | 'shipFlyby'
  | 'skepticalFry'
  | 'wideSpread'

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

const deliveryStormSequence = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'KeyA',
  'KeyB',
  'ArrowUp',
  'ArrowDown',
] as const
const specialCardValues = ['ship', 'BIG', 'nibbler', 'coffee'] as const
const revealCountdownDurationMs = 3_000
const revealCountdownDurationSeconds = revealCountdownDurationMs / 1000

type RoomPageProps = {
  mode?: 'normal' | 'simulator'
}

export function RoomPage({ mode = 'normal' }: RoomPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { roomName: roomNameParam = '' } = useParams()
  const displayRoomName = normalizeRoomName(roomNameParam)
  const backingRoomName =
    mode === 'simulator'
      ? getSimulatorRoomName(displayRoomName)
      : displayRoomName
  const isSimulatorMode = mode === 'simulator'
  const normalizedRoomName = displayRoomName
  const roomNameError = getRoomNameError(roomNameParam)
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
  const [countdownNow, setCountdownNow] = useState(() => Date.now())
  const [localCountdownStartedAt, setLocalCountdownStartedAt] = useState<
    number | null
  >(null)
  const [optimisticRevealedRoundId, setOptimisticRevealedRoundId] = useState<
    string | null
  >(null)
  const [participantActionError, setParticipantActionError] = useState<
    string | null
  >(null)
  const [devClientIdByParticipantId, setDevClientIdByParticipantId] = useState<
    Record<string, string>
  >({})
  const [loadedDevClientIdMapRoomId, setLoadedDevClientIdMapRoomId] = useState<
    string | null
  >(null)
  const [devVoteParticipantId, setDevVoteParticipantId] = useState<
    string | null
  >(null)
  const [isDevParticipantJoining, setIsDevParticipantJoining] = useState(false)
  const [pendingDevVoteParticipantId, setPendingDevVoteParticipantId] =
    useState<string | null>(null)
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
  const [joinRole, setJoinRole] = useState<ParticipantRole>(() => {
    const searchParams = new URLSearchParams(location.search)

    return searchParams.get('joinAs') === 'spectator' ? 'spectator' : 'voter'
  })
  const requestedAutoJoinRole: ParticipantRole | null =
    new URLSearchParams(location.search).get('joinAs') === 'spectator'
      ? 'spectator'
      : null
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
  const displayedPresenceByParticipantId = isSimulatorMode
    ? addDevPresenceParticipants({
        devClientIdByParticipantId,
        participants,
        presenceByParticipantId,
      })
    : presenceByParticipantId
  const devVoteParticipant =
    participants.find(
      (participant) => participant.id === devVoteParticipantId
    ) ?? null
  const countdownAttemptRef = useRef<string | null>(null)
  const lastSeenRoundNumberRef = useRef<number | null>(null)
  const locallyObservedRoundIdsRef = useRef<Set<string>>(new Set())
  const revealedFunRoundKeyRef = useRef<string | null>(null)
  const milestoneRoundKeyRef = useRef<string | null>(null)
  const roundReactionRoundKeyRef = useRef<string | null>(null)
  const roundReactionTimeoutRef = useRef<number | null>(null)
  const funEventTimeoutRef = useRef<number | null>(null)
  const deliveryStormSequenceRef = useRef<string[]>([])
  const deliveryStormSequenceTimeoutRef = useRef<number | null>(null)
  const hypnotoadClickCountRef = useRef(0)
  const hypnotoadClickResetTimeoutRef = useRef<number | null>(null)

  const attemptAutoJoin = useEffectEvent(async () => {
    await handleJoin({
      displayName: identity.displayName,
      avatarKey: identity.avatarKey,
      role: requestedAutoJoinRole ?? undefined,
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

    if (event.mode === 'deliveryStorm') {
      return 9000
    }

    if (event.mode === 'hypnotoad') {
      return 7000
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

    if (
      event.mode === 'deliveryStorm' &&
      activeFunEvent?.mode === 'deliveryStorm'
    ) {
      return
    }

    if (event.mode === 'hypnotoad' && activeFunEvent?.mode === 'hypnotoad') {
      return
    }

    if (event.quote && roundReactionCategory) {
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

  const triggerDeliveryStormEvent = useEffectEvent(() => {
    if (!areFunEffectsEnabled || !isJoinedToRoom || isDeliveryInProgress) {
      return
    }

    void broadcastFunEvent({
      caption: deliveryStormCaption,
      mode: 'deliveryStorm',
    })
  })

  const triggerHypnotoadLogoClickEvent = useEffectEvent(() => {
    void handleHypnotoadLogoClick()
  })

  function navigateHomeWithRoomPrefill() {
    if (!isSimulatorMode && displayRoomName) {
      saveRoomNamePrefill(displayRoomName)
      clearActiveRoomName()
    }

    navigate('/')
  }

  function resetForSelfLeave() {
    if (!isSimulatorMode) {
      clearActiveRoomName()
    }
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
      setRoom(null)

      if (roomNameError) {
        setIsRoomLoading(false)
        setRoomError(roomNameError)
        return
      }

      try {
        const nextRoom = await createOrGetRoom(backingRoomName)

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
  }, [backingRoomName, roomNameError])

  useEffect(() => {
    if (!room || selfParticipant || autoJoinAttemptedRef.current) {
      return
    }

    const activeRoomName = readActiveRoomName()

    if (
      activeRoomName !== room.name &&
      (!isSimulatorMode || activeRoomName !== displayRoomName)
    ) {
      return
    }

    if (!identity.displayName.trim()) {
      return
    }

    autoJoinAttemptedRef.current = true
    void attemptAutoJoin()
  }, [displayRoomName, identity, isSimulatorMode, room, selfParticipant])

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
      setSelfParticipant(null)
      setOptimisticOwnCardValue(null)
      setVoteError('You were kicked from this room.')
      setParticipantActionError(null)
      if (!isSimulatorMode && displayRoomName) {
        saveRoomNamePrefill(displayRoomName)
        clearActiveRoomName()
      }
      navigate('/')
    })
  }, [
    displayRoomName,
    identity.clientId,
    isSimulatorMode,
    navigate,
    participants,
    room?.name,
    selfParticipant,
  ])

  useEffect(() => {
    selfParticipantSyncGraceUntilRef.current = 0
  }, [room?.id])

  useEffect(() => {
    let isCancelled = false

    if (!isSimulatorMode || !room) {
      queueMicrotask(() => {
        if (isCancelled) {
          return
        }

        setDevClientIdByParticipantId({})
        setLoadedDevClientIdMapRoomId(null)
      })

      return () => {
        isCancelled = true
      }
    }

    const roomId = room.id

    queueMicrotask(() => {
      if (isCancelled) {
        return
      }

      setDevClientIdByParticipantId(readDevClientIdMap(roomId))
      setLoadedDevClientIdMapRoomId(roomId)
    })

    return () => {
      isCancelled = true
    }
  }, [isSimulatorMode, room])

  useEffect(() => {
    if (!isSimulatorMode || !room || loadedDevClientIdMapRoomId !== room.id) {
      return
    }

    saveDevClientIdMap(room.id, devClientIdByParticipantId)
  }, [
    devClientIdByParticipantId,
    isSimulatorMode,
    loadedDevClientIdMapRoomId,
    room,
  ])

  async function handleJoin(input?: {
    displayName: string
    avatarKey: string
    role?: ParticipantRole
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
    const nextRole = input?.role ?? (input?.silent ? null : joinRole)

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
        role: nextRole,
      })

      const nextIdentity = {
        clientId,
        displayName: participant.displayName,
        avatarKey: participant.avatarKey,
      }

      selfParticipantSyncGraceUntilRef.current = Date.now() + 4_000
      saveStoredIdentity(nextIdentity)
      if (!isSimulatorMode) {
        saveActiveRoomName(activeRoom.name)
      }
      setIdentity(nextIdentity)
      setDisplayName(participant.displayName)
      setAvatarKey(participant.avatarKey)
      setJoinRole(participant.role)
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
  const isActiveRoundRevealedForDisplay = activeRound?.status === 'revealed'
  const isActiveRoundFinalizingForDisplay =
    !isActiveRoundRevealedForDisplay &&
    Boolean(activeRound) &&
    optimisticRevealedRoundId === activeRound?.id
  const isActiveRoundVotingForDisplay =
    activeRound?.status === 'voting' &&
    localCountdownStartedAt === null &&
    !isActiveRoundFinalizingForDisplay
  const isActiveRoundCountdownForDisplay =
    !isActiveRoundRevealedForDisplay &&
    !isActiveRoundFinalizingForDisplay &&
    (activeRound?.status === 'countdown' || localCountdownStartedAt !== null)
  const submittedVoteParticipantIds = new Set(
    activeRoundVotes.map((vote) => vote.participantId)
  )
  const hasSubmittedVotes = activeRoundVotes.length > 0
  const canReveal =
    isJoinedToRoom &&
    !isRevealSubmitting &&
    Boolean(activeRound) &&
    hasSubmittedVotes &&
    !isActiveRoundRevealedForDisplay &&
    !isActiveRoundFinalizingForDisplay
  const canStartCountdown =
    isJoinedToRoom &&
    !isCountdownSubmitting &&
    Boolean(activeRound) &&
    hasSubmittedVotes &&
    isActiveRoundVotingForDisplay
  const canResetRound =
    isJoinedToRoom &&
    !isResetSubmitting &&
    Boolean(activeRound) &&
    isActiveRoundRevealedForDisplay
  const activeVoters = participants.filter(
    (participant) => participant.role === 'voter'
  )
  const areFunEffectsEnabled = roomSettings?.funLevel === 'chaotic'
  const isDeliveryInProgress =
    activeFunEvent?.mode === 'delivery' ||
    activeFunEvent?.mode === 'deliveryStorm'
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
    isActiveRoundRevealedForDisplay &&
    allVotersHaveSubmitted &&
    scoreSummary.unanimousNumericValue !== null
  const roundReactionCategory =
    activeRound?.status === 'revealed'
      ? getRoundReactionCategory(revealedCardValues, hasMatchingNumericVotes)
      : null
  const isMilestoneRound =
    activeRound !== null &&
    isActiveRoundRevealedForDisplay &&
    activeRound.roundNumber % 100 === 0
  const serverCountdownStartedAt =
    activeRound?.status === 'countdown' && activeRound.countdownStartedAt
      ? new Date(activeRound.countdownStartedAt).getTime()
      : null
  const countdownStartedAt = serverCountdownStartedAt ?? localCountdownStartedAt
  const countdownEndsAt =
    countdownStartedAt !== null
      ? countdownStartedAt + revealCountdownDurationMs
      : null
  const countdownMsRemaining =
    countdownEndsAt !== null && isActiveRoundCountdownForDisplay
      ? Math.max(0, countdownEndsAt - countdownNow)
      : null
  const countdownSecondsRemaining =
    countdownMsRemaining !== null && countdownMsRemaining > 0
      ? Math.min(
          revealCountdownDurationSeconds,
          Math.ceil(countdownMsRemaining / 1000)
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
      if (deliveryStormSequenceTimeoutRef.current !== null) {
        window.clearTimeout(deliveryStormSequenceTimeoutRef.current)
      }
      if (hypnotoadClickResetTimeoutRef.current !== null) {
        window.clearTimeout(hypnotoadClickResetTimeoutRef.current)
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
    if (!isJoinedToRoom || !areFunEffectsEnabled) {
      deliveryStormSequenceRef.current = []
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target

      if (
        target instanceof HTMLElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      ) {
        return
      }

      if (
        !deliveryStormSequence.includes(
          event.code as (typeof deliveryStormSequence)[number]
        )
      ) {
        deliveryStormSequenceRef.current = []
        return
      }

      if (deliveryStormSequenceTimeoutRef.current !== null) {
        window.clearTimeout(deliveryStormSequenceTimeoutRef.current)
      }

      deliveryStormSequenceRef.current = [
        ...deliveryStormSequenceRef.current,
        event.code,
      ].slice(-deliveryStormSequence.length)

      deliveryStormSequenceTimeoutRef.current = window.setTimeout(() => {
        deliveryStormSequenceRef.current = []
        deliveryStormSequenceTimeoutRef.current = null
      }, 4000)

      const hasMatchedSequence = deliveryStormSequence.every(
        (sequenceKey, index) =>
          deliveryStormSequenceRef.current[index] === sequenceKey
      )

      if (!hasMatchedSequence) {
        return
      }

      event.preventDefault()
      deliveryStormSequenceRef.current = []
      triggerDeliveryStormEvent()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [areFunEffectsEnabled, isJoinedToRoom])

  useEffect(() => {
    function handleSiteLogoClick() {
      triggerHypnotoadLogoClickEvent()
    }

    window.addEventListener('pep:hypnotoad-logo-click', handleSiteLogoClick)

    return () => {
      window.removeEventListener(
        'pep:hypnotoad-logo-click',
        handleSiteLogoClick
      )
    }
  }, [])

  useEffect(() => {
    if (!isActiveRoundCountdownForDisplay) {
      return
    }

    const intervalId = window.setInterval(() => {
      setCountdownNow(Date.now())
    }, 100)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isActiveRoundCountdownForDisplay, countdownStartedAt])

  useEffect(() => {
    if (!activeRound) {
      lastSeenRoundNumberRef.current = null
      queueMicrotask(() => {
        setLocalCountdownStartedAt(null)
        setOptimisticRevealedRoundId(null)
      })
      return
    }

    if (
      activeRound.status === 'countdown' ||
      activeRound.status === 'revealed'
    ) {
      queueMicrotask(() => {
        setLocalCountdownStartedAt(null)
      })
    }

    if (activeRound.status === 'revealed') {
      queueMicrotask(() => {
        setOptimisticRevealedRoundId(null)
      })
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
      setLocalCountdownStartedAt(null)
      setOptimisticRevealedRoundId(null)
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
      roundReactionCategory ||
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
    roundReactionCategory,
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
      !roundReactionCategory ||
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
      roundReactionTimeoutRef.current = null
    }

    if (funEventTimeoutRef.current !== null) {
      window.clearTimeout(funEventTimeoutRef.current)
      funEventTimeoutRef.current = null
    }

    if (roundReactionCategory === 'shipFlyby') {
      queueMicrotask(() => {
        setActiveRoundReaction(null)

        void broadcastFunEvent({
          caption: deliveryCaption,
          mode: 'flyby',
        })
      })

      return
    }

    if (roundReactionCategory === 'allSpecialCards') {
      queueMicrotask(() => {
        setActiveRoundReaction(null)

        void broadcastFunEvent({
          caption: deliveryStormCaption,
          mode: 'deliveryStorm',
        })
      })

      return
    }

    if (!activeRound.reactionKind) {
      return
    }

    queueMicrotask(() => {
      setActiveFunEvent(null)
      setActiveRoundReaction(activeRound.reactionKind)
    })

    roundReactionTimeoutRef.current = window.setTimeout(() => {
      setActiveRoundReaction(null)
      roundReactionTimeoutRef.current = null
    }, 5000)
  }, [
    activeRound,
    isMilestoneRound,
    roomSettings?.funLevel,
    roundReactionCategory,
  ])

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
      !isActiveRoundCountdownForDisplay ||
      countdownEndsAt === null
    ) {
      return
    }

    const revealDelayMs = Math.max(0, countdownEndsAt - Date.now())
    const timeoutId = window.setTimeout(() => {
      void finalizeRevealEvent()
    }, revealDelayMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [activeRound, countdownEndsAt, isActiveRoundCountdownForDisplay, room])

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

  async function handleSpawnDevParticipant() {
    if (!isSimulatorMode || !room) {
      return
    }

    const avatar = pickRandomAvatar()
    const displayName = createDevDisplayName(
      participants.map((participant) => participant.displayName)
    )
    const clientId = createClientId()

    setIsDevParticipantJoining(true)
    setParticipantActionError(null)

    try {
      const participant = await joinRoom({
        roomName: room.name,
        clientId,
        displayName,
        avatarKey: avatar.key,
        role: 'voter',
      })

      setDevClientIdByParticipantId((currentClientIds) => ({
        ...currentClientIds,
        [participant.participantId]: clientId,
      }))
    } catch (error) {
      setParticipantActionError(
        error instanceof Error
          ? error.message
          : 'Failed to spawn local dev user.'
      )
    } finally {
      setIsDevParticipantJoining(false)
    }
  }

  async function handleDevVote(cardValue: string) {
    if (!isSimulatorMode || !room || !devVoteParticipant) {
      return
    }

    const devClientId =
      devVoteParticipant.id === selfParticipant?.participantId
        ? identity.clientId
        : devClientIdByParticipantId[devVoteParticipant.id]

    if (!devClientId) {
      setParticipantActionError(
        'This participant was not spawned by this browser.'
      )
      return
    }

    setPendingDevVoteParticipantId(devVoteParticipant.id)
    setParticipantActionError(null)

    try {
      await submitVote({
        roomId: room.id,
        clientId: devClientId,
        cardValue,
      })
      setDevVoteParticipantId(null)
    } catch (error) {
      setParticipantActionError(
        error instanceof Error ? error.message : 'Failed to submit dev vote.'
      )
    } finally {
      setPendingDevVoteParticipantId(null)
    }
  }

  async function handleRevealCountdown() {
    if (!room || !selfParticipant) {
      return
    }

    setLocalCountdownStartedAt(Date.now())
    setOptimisticRevealedRoundId(null)
    setCountdownNow(Date.now())
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
      setLocalCountdownStartedAt(null)
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
      setLocalCountdownStartedAt(null)
      setOptimisticRevealedRoundId(activeRound?.id ?? null)
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
      setLocalCountdownStartedAt(null)
      setOptimisticRevealedRoundId(activeRound?.id ?? null)
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

  async function handleHypnotoadLogoClick() {
    if (!room || !selfParticipant || !areFunEffectsEnabled) {
      return
    }

    hypnotoadClickCountRef.current += 1

    if (hypnotoadClickResetTimeoutRef.current !== null) {
      window.clearTimeout(hypnotoadClickResetTimeoutRef.current)
    }

    hypnotoadClickResetTimeoutRef.current = window.setTimeout(() => {
      hypnotoadClickCountRef.current = 0
      hypnotoadClickResetTimeoutRef.current = null
    }, 4200)

    if (hypnotoadClickCountRef.current < 10) {
      return
    }

    hypnotoadClickCountRef.current = 0

    try {
      const result = await triggerHypnotoadEasterEgg({
        roomId: room.id,
        actorClientId: identity.clientId,
      })

      if (!result.result_triggered) {
        setSettingsError('Hypnotoad is resting for now.')
        return
      }

      const hypnotoadEvent = {
        caption: hypnotoadCaption,
        mode: 'hypnotoad',
      } satisfies RoomFunEvent

      setSettingsError(null)
      showFunEvent(hypnotoadEvent)
      await sendFunEvent(hypnotoadEvent)
    } catch (error) {
      setSettingsError(
        error instanceof Error ? error.message : 'Failed to summon Hypnotoad.'
      )
    }
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
      setLocalCountdownStartedAt(null)
      setOptimisticRevealedRoundId(null)
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
    if (!room || !selfParticipant || !roomSettings || !isSelfRoomOwner) {
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
        'Room owner cannot leave. Close the room from the rooms page instead.'
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
      navigateHomeWithRoomPrefill()
    } catch (error) {
      setParticipantActionError(
        error instanceof Error ? error.message : 'Failed to leave room.'
      )
    } finally {
      setPendingParticipantActionId(null)
    }
  }

  const scoreSummaryPanel = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-4 mb-4 min-h-[12rem] rounded-[18px] border-2 border-[var(--pep-accent-2)]/35 bg-[linear-gradient(135deg,_#fff7ce,_#ffffff_58%,_#d7f5eb)] p-4 shadow-[0_14px_34px_rgba(31,160,137,0.13)] sm:h-[12rem] sm:overflow-hidden"
    >
      {isActiveRoundRevealedForDisplay ? (
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
          const cardArtworkLabel = getCardArtworkLabel(card)

          return (
            <motion.div
              key={card}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: index * 0.025 }}
              className="h-24 sm:h-28"
            >
              <button
                type="button"
                aria-label={
                  cardMeaningLabel
                    ? `${cardArtworkLabel} card, ${cardMeaningLabel}`
                    : `${cardLabel} card`
                }
                onClick={() => void handleVote(card)}
                disabled={
                  !isJoinedToRoom ||
                  effectiveSelfRole !== 'voter' ||
                  isVoteSubmitting ||
                  !isActiveRoundVotingForDisplay
                }
                className={[
                  'relative flex h-full w-full flex-col justify-between rounded-[12px] border p-3 text-left shadow-[0_8px_18px_rgba(12,32,42,0.07)]',
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
                      alt={cardArtworkLabel}
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
    activeRoomName ===
      (isSimulatorMode ? displayRoomName : (room?.name ?? displayRoomName))
  )
  const shouldDeferJoinModal =
    !isJoinedToRoom &&
    (isRoomLoading ||
      isJoining ||
      (hasStoredAutoJoinTarget && !joinError && !roomError))
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
              {isSimulatorMode ? 'Join simulator' : 'Join room'}
            </p>
            <h2
              id="join-room-title"
              className="mt-1 font-[var(--pep-font-display)] text-4xl leading-none text-[var(--pep-ink)]"
            >
              {normalizedRoomName || 'Room'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--pep-ink-soft)]">
              {isSimulatorMode
                ? 'Enter your name and choose an avatar before testing the sandbox room.'
                : 'Enter your name and choose an avatar before viewing the room.'}
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
              Join as
            </span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={joinRole === 'voter'}
                onClick={() => setJoinRole('voter')}
                disabled={isJoining || isRoomLoading}
                className={[
                  'rounded-[12px] border px-4 py-3 text-sm font-black uppercase transition disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400',
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
                disabled={isJoining || isRoomLoading}
                className={[
                  'rounded-[12px] border px-4 py-3 text-sm font-black uppercase transition disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400',
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
                ? 'Spectators join immediately without voting cards.'
                : "Voters can estimate right away. The room is created if it doesn't exist yet."}
            </p>
          </div>

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
                      'grid aspect-square place-items-center rounded-[12px] border p-1.5',
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
            className="w-full rounded-[14px] border-2 border-[var(--pep-ink)] bg-[var(--pep-accent)] px-5 py-3 text-sm font-black uppercase text-white shadow-[0_8px_0_rgba(20,38,51,0.24)] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
          >
            {joinRole === 'spectator' ? 'Join as spectator' : 'Join as voter'}
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
            {Object.keys(displayedPresenceByParticipantId).length} online
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
          const isOnline = Boolean(
            displayedPresenceByParticipantId[participant.id]
          )
          const isSelf = participant.id === selfParticipant?.participantId
          const isRoomOwner = participant.id === roomOwnerParticipantId
          const hasSubmittedVote =
            submittedVoteParticipantIds.has(participant.id) ||
            (isSelf && Boolean(displayedOwnCardValue))
          const revealedCardValue = revealedVoteByParticipantId.get(
            participant.id
          )
          const isRevealedShipCard = revealedCardValue === 'ship'
          const nextRole = participant.role === 'voter' ? 'spectator' : 'voter'
          const isParticipantActionPending =
            pendingParticipantActionId === participant.id
          const canDevVoteAsParticipant =
            isSimulatorMode &&
            isJoinedToRoom &&
            isActiveRoundVotingForDisplay &&
            participant.role === 'voter' &&
            Boolean(devClientIdByParticipantId[participant.id])

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
                      isActiveRoundRevealedForDisplay
                        ? revealedCardValue
                          ? [
                              'border-[var(--pep-ink)] bg-[var(--pep-yellow)] text-[var(--pep-ink)] shadow-[0_5px_0_rgba(20,38,51,0.14)]',
                              isRevealedShipCard ? 'text-3xl' : 'text-xl',
                            ].join(' ')
                          : 'border-slate-300 bg-slate-100 text-sm text-slate-500'
                        : 'border-transparent bg-transparent text-transparent',
                    ].join(' ')}
                  >
                    {isActiveRoundRevealedForDisplay
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
                    <div className="mt-3 flex items-center gap-1.5 pr-11">
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
                          'grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 disabled:cursor-default disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none',
                          nextRole === 'spectator'
                            ? 'border-[var(--pep-line-strong)] bg-white text-[var(--pep-ink)] shadow-[0_5px_12px_rgba(12,32,42,0.08)]'
                            : 'border-[var(--pep-accent-2)] bg-[var(--pep-accent-2)] text-white shadow-[0_5px_12px_rgba(31,152,134,0.18)]',
                        ].join(' ')}
                      >
                        <EyeIcon crossed={nextRole === 'spectator'} />
                      </button>
                      {isSelf && !isRoomOwner ? (
                        <button
                          type="button"
                          aria-label="Leave room"
                          title="Leave room"
                          onClick={() => void handleLeaveRoom(participant.id)}
                          disabled={isParticipantActionPending}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-[var(--pep-line-strong)] bg-white text-[var(--pep-ink)] shadow-[0_5px_12px_rgba(12,32,42,0.08)] disabled:cursor-default disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                        >
                          <LeaveIcon />
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
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-[var(--pep-accent)] bg-white text-[var(--pep-accent)] shadow-[0_5px_12px_rgba(212,47,38,0.14)] disabled:cursor-default disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                        >
                          <KickIcon />
                        </button>
                      )}
                    </div>
                  ) : null}
                  {canDevVoteAsParticipant ? (
                    <button
                      type="button"
                      onClick={() => setDevVoteParticipantId(participant.id)}
                      disabled={pendingDevVoteParticipantId === participant.id}
                      className="mt-2 mr-11 inline-flex min-h-7 items-center rounded-full border border-[var(--pep-line-strong)] bg-white/86 px-2.5 py-1 text-[10px] font-black text-[var(--pep-ink)] shadow-[0_4px_10px_rgba(12,32,42,0.06)] hover:border-[var(--pep-accent-2)] disabled:cursor-default disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                    >
                      Simulate vote
                    </button>
                  ) : null}
                </div>
              </div>
              <div
                title={hasSubmittedVote ? 'Vote submitted' : 'Waiting for vote'}
                aria-label={
                  hasSubmittedVote ? 'Vote submitted' : 'Waiting for vote'
                }
                className={[
                  'absolute bottom-2.5 right-2.5 grid h-9 w-9 place-items-center rounded-full border-2',
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

  const devVoteDialog =
    isSimulatorMode && devVoteParticipant ? (
      <div className="fixed inset-0 z-[70] grid place-items-center bg-[rgba(20,38,51,0.62)] px-4 py-8 backdrop-blur-sm">
        <motion.section
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dev-vote-title"
          className="w-full max-w-2xl rounded-[22px] border-2 border-[var(--pep-ink)] bg-[linear-gradient(160deg,_#ffffff,_#dff7ef)] p-5 shadow-[0_28px_80px_rgba(12,32,42,0.34)]"
        >
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--pep-accent-2)]">
            Simulate vote
          </p>
          <h2
            id="dev-vote-title"
            className="mt-2 font-[var(--pep-font-display)] text-4xl leading-none text-[var(--pep-ink)]"
          >
            {devVoteParticipant.displayName}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--pep-ink-soft)]">
            Submit a vote as this participant on the real room page.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {fibonacciDeck.map((cardValue) => {
              const cardMeaningLabel = getCardMeaningLabel(cardValue)
              const cardArtworkLabel = getCardArtworkLabel(cardValue)

              return (
                <button
                  key={cardValue}
                  type="button"
                  onClick={() => void handleDevVote(cardValue)}
                  disabled={
                    pendingDevVoteParticipantId === devVoteParticipant.id ||
                    !isActiveRoundVotingForDisplay
                  }
                  className="min-h-16 rounded-[12px] border-2 border-[var(--pep-line-strong)] bg-white px-3 py-2 text-sm font-black text-[var(--pep-ink)] shadow-[0_7px_0_rgba(20,38,51,0.1)] disabled:cursor-default disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                >
                  <span className="block">
                    {cardMeaningLabel ?? getCardDisplayLabel(cardValue)}
                  </span>
                  {cardMeaningLabel && cardArtworkLabel !== cardMeaningLabel ? (
                    <span className="mt-1 block text-[0.65rem] uppercase opacity-70">
                      {cardArtworkLabel}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => setDevVoteParticipantId(null)}
              className="rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-4 py-2.5 text-sm font-black uppercase text-[var(--pep-ink)]"
            >
              Cancel
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
              <div className="flex items-start">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase text-[var(--pep-accent)]">
                    {isSimulatorMode ? 'Simulator room' : 'Room'}
                  </p>
                  <h2 className="mt-2 break-words font-[var(--pep-font-display)] text-4xl leading-none text-[var(--pep-ink)]">
                    {normalizedRoomName || 'Unknown room'}
                  </h2>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--pep-ink-soft)]">
                {isSimulatorMode
                  ? 'Sandboxed simulator for testing votes, reveals, and animations.'
                  : 'Join, copy the link, and start estimating.'}
              </p>

              {isSimulatorMode ? (
                <p className="mt-3 rounded-[12px] border border-[var(--pep-accent-2)]/30 bg-[var(--pep-accent-2)]/10 px-3 py-2 text-sm font-semibold text-[var(--pep-ink-soft)]">
                  Writes go to sandbox room {backingRoomName}, not the real
                  room.
                </p>
              ) : null}

              {isJoinedToRoom && areFunEffectsEnabled ? (
                <button
                  type="button"
                  disabled={isDeliveryInProgress}
                  onClick={() => void handleDeliveryDrop()}
                  className="mt-4 flex w-full items-center justify-between gap-3 rounded-[14px] border border-[var(--pep-accent-2)]/35 bg-[linear-gradient(135deg,_#caf6e9,_#fff5b2)] px-4 py-3 text-left text-sm font-black uppercase tracking-[0.08em] text-[var(--pep-ink)] shadow-[0_12px_24px_rgba(31,160,137,0.16)] disabled:cursor-default disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-600 disabled:shadow-none"
                >
                  <span>Request Planet Express delivery</span>
                  <img
                    src="/planet-express-ship.png"
                    alt=""
                    className="h-8 w-20 shrink-0 object-contain"
                  />
                </button>
              ) : null}

              {isSimulatorMode && isJoinedToRoom ? (
                <div className="mt-4 rounded-[14px] border border-dashed border-[var(--pep-accent-2)]/60 bg-[var(--pep-accent-2)]/10 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase text-[var(--pep-accent-2)]">
                        Simulator tools
                      </p>
                      <p className="mt-1 text-sm leading-5 text-[var(--pep-ink-soft)]">
                        Spawn fake voters, then simulate votes from their cards.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleSpawnDevParticipant()}
                      disabled={!room || isDevParticipantJoining}
                      className="rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-3 py-2 text-xs font-black uppercase text-[var(--pep-ink)] shadow-[0_6px_14px_rgba(12,32,42,0.08)] disabled:cursor-default disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                    >
                      Spawn fake user
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-3 py-2 text-sm font-semibold text-[var(--pep-ink)]"
                >
                  Copy invite link
                </button>
                <button
                  type="button"
                  onClick={() => void handleFunLevelToggle()}
                  disabled={
                    !isJoinedToRoom ||
                    !roomSettings ||
                    isFunLevelSaving ||
                    !isSelfRoomOwner
                  }
                  className={[
                    'rounded-[10px] px-3 py-2 text-xs font-black uppercase',
                    roomSettings?.funLevel === 'chaotic'
                      ? 'bg-[var(--pep-accent)] text-white shadow-[0_10px_22px_rgba(212,47,38,0.24)]'
                      : 'border border-[var(--pep-line-strong)] bg-white text-[var(--pep-ink)]',
                  ].join(' ')}
                >
                  {roomSettings?.funLevel === 'chaotic'
                    ? 'Effects: on'
                    : 'Effects: off'}
                </button>
                {!isSelfRoomOwner && isJoinedToRoom ? (
                  <button
                    type="button"
                    onClick={() =>
                      selfParticipant
                        ? void handleLeaveRoom(selfParticipant.participantId)
                        : undefined
                    }
                    disabled={
                      !selfParticipant ||
                      pendingParticipantActionId ===
                        selfParticipant.participantId
                    }
                    className="rounded-[10px] border border-[var(--pep-line-strong)] bg-white px-3 py-2 text-xs font-black uppercase text-[var(--pep-ink)] shadow-[0_8px_18px_rgba(12,32,42,0.08)] disabled:cursor-default disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                  >
                    Leave room
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
                  {isSelfRoomOwner
                    ? '.'
                    : '. Only the room owner can change this.'}
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
                              'grid h-11 w-11 place-items-center rounded-[10px] border p-1',
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
                    className="rounded-[10px] bg-[var(--pep-accent)] px-4 py-2.5 text-sm font-black uppercase text-white shadow-[0_10px_24px_rgba(212,47,38,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isJoinedToRoom ? 'Update profile' : 'Join room'}
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
                    {isActiveRoundCountdownForDisplay &&
                    countdownSecondsRemaining !== null
                      ? `reveal in ${countdownSecondsRemaining}`
                      : isActiveRoundRevealedForDisplay
                        ? 'revealed'
                        : isActiveRoundCountdownForDisplay ||
                            isActiveRoundFinalizingForDisplay
                          ? 'revealing'
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
                    'min-h-12 rounded-[12px] border-2 px-4 py-2 text-xs font-black uppercase sm:text-sm',
                    canReveal
                      ? 'cursor-pointer border-[var(--pep-ink)] bg-[var(--pep-accent)] text-white shadow-[0_8px_0_rgba(20,38,51,0.24)]'
                      : 'cursor-default border-slate-300 bg-slate-100 text-slate-400 shadow-none',
                  ].join(' ')}
                >
                  Reveal
                </button>
                <button
                  type="button"
                  onClick={() => void handleRevealCountdown()}
                  disabled={!canStartCountdown}
                  className={[
                    'min-h-12 rounded-[12px] border-2 px-4 py-2 text-xs font-black uppercase sm:text-sm',
                    canStartCountdown
                      ? 'cursor-pointer border-[var(--pep-ink)] bg-[var(--pep-yellow)] text-[var(--pep-ink)] shadow-[0_8px_0_rgba(20,38,51,0.18)]'
                      : 'cursor-default border-slate-300 bg-slate-100 text-slate-400 shadow-none',
                  ].join(' ')}
                >
                  Countdown
                </button>
                <button
                  type="button"
                  onClick={() => void handleResetRound()}
                  disabled={!canResetRound}
                  className={[
                    'min-h-12 rounded-[12px] border-2 px-4 py-2 text-xs font-black uppercase sm:text-sm',
                    canResetRound
                      ? 'cursor-pointer border-[var(--pep-ink)] bg-[var(--pep-accent-2)] text-white shadow-[0_8px_0_rgba(20,38,51,0.24)] ring-4 ring-[var(--pep-yellow)]/35'
                      : 'cursor-default border-slate-300 bg-slate-100 text-slate-400 shadow-none',
                  ].join(' ')}
                >
                  Next round
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
      {devVoteDialog}
    </div>
  )
}

function getDevClientIdStorageKey(roomId: string) {
  return `pep.dev-room-clients.v1:${roomId}`
}

function addDevPresenceParticipants(input: {
  devClientIdByParticipantId: Record<string, string>
  participants: Array<
    Pick<Participant, 'avatarKey' | 'displayName' | 'id' | 'role'>
  >
  presenceByParticipantId: Record<string, PresenceParticipant>
}) {
  const nextPresenceByParticipantId = { ...input.presenceByParticipantId }

  for (const participant of input.participants) {
    if (
      !input.devClientIdByParticipantId[participant.id] ||
      nextPresenceByParticipantId[participant.id]
    ) {
      continue
    }

    nextPresenceByParticipantId[participant.id] = {
      participantId: participant.id,
      displayName: participant.displayName,
      avatarKey: participant.avatarKey,
      role: participant.role,
      onlineAt: 'local-dev',
    }
  }

  return nextPresenceByParticipantId
}

function readDevClientIdMap(roomId: string) {
  try {
    const rawValue = window.sessionStorage.getItem(
      getDevClientIdStorageKey(roomId)
    )

    if (!rawValue) {
      return {}
    }

    const parsedValue = JSON.parse(rawValue) as Record<string, unknown>

    return Object.fromEntries(
      Object.entries(parsedValue).filter(
        (entry): entry is [string, string] =>
          typeof entry[0] === 'string' &&
          typeof entry[1] === 'string' &&
          Boolean(entry[0]) &&
          Boolean(entry[1])
      )
    )
  } catch {
    return {}
  }
}

function saveDevClientIdMap(
  roomId: string,
  clientIdByParticipantId: Record<string, string>
) {
  window.sessionStorage.setItem(
    getDevClientIdStorageKey(roomId),
    JSON.stringify(clientIdByParticipantId)
  )
}

function pickRandomAvatar() {
  return avatarOptions[Math.floor(Math.random() * avatarOptions.length)]
}

function createDevDisplayName(existingDisplayNames: string[]) {
  const existingDisplayNameSet = new Set(
    existingDisplayNames.map((displayName) => displayName.toLowerCase())
  )

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = `Dev-${Math.random().toString(36).slice(2, 8)}`.slice(
      0,
      maxDisplayNameLength
    )

    if (!existingDisplayNameSet.has(candidate.toLowerCase())) {
      return candidate
    }
  }

  return `Dev-${Date.now().toString(36).slice(-6)}`.slice(
    0,
    maxDisplayNameLength
  )
}

function getSimulatorRoomName(roomName: string) {
  const normalizedRoomName = normalizeRoomName(roomName) || 'room'
  const suffix = `_${Math.abs(hashString(normalizedRoomName)).toString(36)}`
  const prefix = 'dev_'
  const maxBaseLength = maxRoomNameLength - prefix.length - suffix.length
  const baseRoomName = normalizedRoomName.slice(0, maxBaseLength)

  return `${prefix}${baseRoomName}${suffix}`
}

function hashString(value: string) {
  return value.split('').reduce((hash, character) => {
    return (hash << 5) - hash + character.charCodeAt(0)
  }, 0)
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

function getRoundReactionCategory(
  cardValues: string[],
  hasMatchingNumericVotes: boolean
): RoundReactionCategory | null {
  const uniqueCardValues = new Set(cardValues)

  if (specialCardValues.every((cardValue) => uniqueCardValues.has(cardValue))) {
    return 'allSpecialCards'
  }

  if (cardValues.includes('coffee')) {
    return 'coffee'
  }

  if (cardValues.includes('nibbler')) {
    return 'nibblerQuestion'
  }

  if (cardValues.includes('ship')) {
    return 'shipFlyby'
  }

  if (cardValues.includes('BIG')) {
    return 'skepticalFry'
  }

  if (hasMatchingNumericVotes) {
    return 'consensus'
  }

  if (hasExactFibonacciSpread(cardValues)) {
    return 'fibonacciSpread'
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

  return highestCardIndex - lowestCardIndex > 1 ? 'wideSpread' : null
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

function hasExactFibonacciSpread(cardValues: string[]) {
  const uniqueNumericCardIndexes = new Set(
    cardValues
      .map((cardValue) =>
        numericCardIndexByValue.get(
          cardValue as (typeof numericCardValues)[number]
        )
      )
      .filter((cardIndex): cardIndex is number => cardIndex !== undefined)
  )

  if (uniqueNumericCardIndexes.size < 2 || uniqueNumericCardIndexes.size > 4) {
    return false
  }

  const sortedCardIndexes = Array.from(uniqueNumericCardIndexes).sort(
    (leftCardIndex, rightCardIndex) => leftCardIndex - rightCardIndex
  )

  return sortedCardIndexes.every((cardIndex, index) => {
    if (index === 0) {
      return true
    }

    return cardIndex === sortedCardIndexes[index - 1] + 1
  })
}
