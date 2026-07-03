export type Room = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type RoomFunLevel = 'disabled' | 'chaotic'

export type RoomSettings = {
  roomId: string
  deckType: 'fibonacci'
  autoRevealEnabled: boolean
  revealCountdownEnabled: boolean
  revealCountdownSeconds: number
  funLevel: RoomFunLevel
  updatedAt: string
}

export type ParticipantRole = 'voter' | 'spectator'

export type Participant = {
  id: string
  roomId: string
  displayName: string
  avatarKey: string
  role: ParticipantRole
  isKicked: boolean
  createdAt: string
}

export type RoundStatus = 'voting' | 'countdown' | 'revealed'

export type Round = {
  id: string
  roomId: string
  roundNumber: number
  status: RoundStatus
  countdownStartedAt: string | null
  countdownSeconds: number
  revealedAt: string | null
}

export type JoinedParticipant = {
  participantId: string
  roomId: string
  roomName: string
  displayName: string
  avatarKey: string
  role: ParticipantRole
  isKicked: boolean
}

export type PresenceParticipant = {
  participantId: string
  displayName: string
  avatarKey: string
  role: ParticipantRole
  onlineAt: string
}

export type Vote = {
  roundId: string
  participantId: string
  cardValue: string
  submittedAt: string
}

export type SubmittedVote = {
  roundId: string
  participantId: string
  cardValue: string
  submittedAt: string
}
