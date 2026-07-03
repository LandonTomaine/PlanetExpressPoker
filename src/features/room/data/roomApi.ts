import { z } from 'zod'
import { supabase } from '../../../lib/supabase/client'
import type {
  JoinedParticipant,
  Participant,
  ParticipantRole,
  Room,
  RoomFunLevel,
  RoomSettings,
  Round,
  SubmittedVote,
  Vote,
} from '../types'

const roomSchema = z.object({
  result_room_id: z.string().uuid(),
  result_room_name: z.string().min(1),
  result_room_created_at: z.string(),
  result_room_updated_at: z.string(),
})

const participantSchema = z.object({
  id: z.string().uuid(),
  room_id: z.string().uuid(),
  display_name: z.string().min(1),
  avatar_key: z.string().min(1),
  role: z.enum(['voter', 'spectator']),
  is_kicked: z.boolean(),
  created_at: z.string(),
})

const roomSettingsSchema = z.object({
  room_id: z.string().uuid(),
  deck_type: z.literal('fibonacci'),
  auto_reveal_enabled: z.boolean(),
  reveal_countdown_enabled: z.boolean(),
  reveal_countdown_seconds: z.number().int().min(1),
  fun_level: z.enum(['disabled', 'chaotic']),
  updated_at: z.string(),
})

const roundSchema = z.object({
  id: z.string().uuid(),
  room_id: z.string().uuid(),
  round_number: z.number().int().positive(),
  status: z.enum(['voting', 'countdown', 'revealed']),
  countdown_started_at: z.string().nullable(),
  countdown_seconds: z.number().int().min(1),
  revealed_at: z.string().nullable(),
})

const voteSchema = z.object({
  round_id: z.string().uuid(),
  participant_id: z.string().uuid(),
  card_value: z.string().min(1),
  submitted_at: z.string(),
})

const joinedParticipantSchema = z.object({
  result_participant_id: z.string().uuid(),
  result_room_id: z.string().uuid(),
  result_room_name: z.string().min(1),
  result_display_name: z.string().min(1),
  result_avatar_key: z.string().min(1),
  result_role: z.enum(['voter', 'spectator']),
  result_is_kicked: z.boolean(),
})

const submittedVoteSchema = z.object({
  result_round_id: z.string().uuid(),
  result_participant_id: z.string().uuid(),
  result_card_value: z.string().min(1),
  result_submitted_at: z.string(),
})

const participantRoleMutationSchema = z.object({
  result_participant_id: z.string().uuid(),
  result_role: z.enum(['voter', 'spectator']),
  result_is_kicked: z.boolean(),
})

const kickParticipantSchema = z.object({
  result_participant_id: z.string().uuid(),
  result_is_kicked: z.boolean(),
})

const leaveRoomSchema = z.object({
  result_participant_id: z.string().uuid(),
})

const revealCountdownSchema = z.object({
  result_round_id: z.string().uuid(),
  result_status: z.enum(['voting', 'countdown', 'revealed']),
  result_countdown_started_at: z.string().nullable(),
  result_countdown_seconds: z.number().int().min(1),
})

const revealRoundSchema = z.object({
  result_round_id: z.string().uuid(),
  result_status: z.enum(['voting', 'countdown', 'revealed']),
  result_revealed_at: z.string().nullable(),
})

const resetRoundSchema = z.object({
  result_round_id: z.string().uuid(),
  result_round_number: z.number().int().positive(),
  result_status: z.enum(['voting', 'countdown', 'revealed']),
  result_countdown_started_at: z.string().nullable(),
  result_revealed_at: z.string().nullable(),
})

const roomFunLevelSchema = z.object({
  result_room_id: z.string().uuid(),
  result_fun_level: z.enum(['disabled', 'chaotic']),
  result_updated_at: z.string(),
})

function mapRoom(room: z.infer<typeof roomSchema>): Room {
  return {
    id: room.result_room_id,
    name: room.result_room_name,
    createdAt: room.result_room_created_at,
    updatedAt: room.result_room_updated_at,
  }
}

function mapParticipant(
  participant: z.infer<typeof participantSchema>
): Participant {
  return {
    id: participant.id,
    roomId: participant.room_id,
    displayName: participant.display_name,
    avatarKey: participant.avatar_key,
    role: participant.role,
    isKicked: participant.is_kicked,
    createdAt: participant.created_at,
  }
}

function mapRoomSettings(
  roomSettings: z.infer<typeof roomSettingsSchema>
): RoomSettings {
  return {
    roomId: roomSettings.room_id,
    deckType: roomSettings.deck_type,
    autoRevealEnabled: roomSettings.auto_reveal_enabled,
    revealCountdownEnabled: roomSettings.reveal_countdown_enabled,
    revealCountdownSeconds: roomSettings.reveal_countdown_seconds,
    funLevel: roomSettings.fun_level,
    updatedAt: roomSettings.updated_at,
  }
}

function mapJoinedParticipant(
  participant: z.infer<typeof joinedParticipantSchema>
): JoinedParticipant {
  return {
    participantId: participant.result_participant_id,
    roomId: participant.result_room_id,
    roomName: participant.result_room_name,
    displayName: participant.result_display_name,
    avatarKey: participant.result_avatar_key,
    role: participant.result_role,
    isKicked: participant.result_is_kicked,
  }
}

function mapRound(round: z.infer<typeof roundSchema>): Round {
  return {
    id: round.id,
    roomId: round.room_id,
    roundNumber: round.round_number,
    status: round.status,
    countdownStartedAt: round.countdown_started_at,
    countdownSeconds: round.countdown_seconds,
    revealedAt: round.revealed_at,
  }
}

function mapVote(vote: z.infer<typeof voteSchema>): Vote {
  return {
    roundId: vote.round_id,
    participantId: vote.participant_id,
    cardValue: vote.card_value,
    submittedAt: vote.submitted_at,
  }
}

function mapSubmittedVote(
  vote: z.infer<typeof submittedVoteSchema>
): SubmittedVote {
  return {
    roundId: vote.result_round_id,
    participantId: vote.result_participant_id,
    cardValue: vote.result_card_value,
    submittedAt: vote.result_submitted_at,
  }
}

function getMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message
  ) {
    return error.message
  }

  return 'Something went wrong.'
}

export async function createOrGetRoom(roomName: string) {
  const { data, error } = await supabase.rpc('create_or_get_room', {
    requested_room_name: roomName,
  })

  if (error) {
    throw new Error(getMessage(error))
  }

  const parsedData = z.array(roomSchema).length(1).parse(data)

  return mapRoom(parsedData[0])
}

export async function joinRoom(input: {
  roomName: string
  clientId: string
  displayName: string
  avatarKey: string
}) {
  const { data, error } = await supabase.rpc('join_room', {
    requested_room_name: input.roomName,
    participant_client_id: input.clientId,
    participant_display_name: input.displayName,
    participant_avatar_key: input.avatarKey,
  })

  if (error) {
    throw new Error(getMessage(error))
  }

  const parsedData = z.array(joinedParticipantSchema).length(1).parse(data)

  return mapJoinedParticipant(parsedData[0])
}

export async function listParticipants(roomId: string) {
  const { data, error } = await supabase.rpc('list_room_participants', {
    target_room_id: roomId,
  })

  if (error) {
    throw new Error(getMessage(error))
  }

  return z.array(participantSchema).parse(data).map(mapParticipant)
}

export async function getRoomSettings(roomId: string) {
  const { data, error } = await supabase
    .from('room_settings')
    .select(
      'room_id, deck_type, auto_reveal_enabled, reveal_countdown_enabled, reveal_countdown_seconds, fun_level, updated_at'
    )
    .eq('room_id', roomId)
    .single()

  if (error) {
    throw new Error(getMessage(error))
  }

  return mapRoomSettings(roomSettingsSchema.parse(data))
}

export async function getActiveRound(roomId: string) {
  const { data, error } = await supabase
    .from('rounds')
    .select(
      'id, room_id, round_number, status, countdown_started_at, countdown_seconds, revealed_at'
    )
    .eq('room_id', roomId)
    .single()

  if (error) {
    throw new Error(getMessage(error))
  }

  return mapRound(roundSchema.parse(data))
}

export async function listVotes(input: {
  roundId: string
  actorClientId: string
}) {
  const { data, error } = await supabase.rpc('list_round_votes', {
    target_round_id: input.roundId,
    actor_client_id: input.actorClientId,
  })

  if (error) {
    throw new Error(getMessage(error))
  }

  return z.array(voteSchema).parse(data).map(mapVote)
}

export async function submitVote(input: {
  roomId: string
  clientId: string
  cardValue: string
}) {
  const { data, error } = await supabase.rpc('submit_vote', {
    target_room_id: input.roomId,
    participant_client_id: input.clientId,
    selected_card_value: input.cardValue,
  })

  if (error) {
    throw new Error(getMessage(error))
  }

  const parsedData = z.array(submittedVoteSchema).length(1).parse(data)

  return mapSubmittedVote(parsedData[0])
}

export async function setParticipantRole(input: {
  roomId: string
  actorClientId: string
  targetParticipantId: string
  nextRole: ParticipantRole
}) {
  const { data, error } = await supabase.rpc('set_participant_role', {
    target_room_id: input.roomId,
    actor_client_id: input.actorClientId,
    target_participant_id: input.targetParticipantId,
    next_role: input.nextRole,
  })

  if (error) {
    throw new Error(getMessage(error))
  }

  return z.array(participantRoleMutationSchema).length(1).parse(data)[0]
}

export async function kickParticipant(input: {
  roomId: string
  actorClientId: string
  targetParticipantId: string
}) {
  const { data, error } = await supabase.rpc('kick_participant', {
    target_room_id: input.roomId,
    actor_client_id: input.actorClientId,
    target_participant_id: input.targetParticipantId,
  })

  if (error) {
    throw new Error(getMessage(error))
  }

  return z.array(kickParticipantSchema).length(1).parse(data)[0]
}

export async function leaveRoom(input: {
  roomId: string
  actorClientId: string
}) {
  const { data, error } = await supabase.rpc('leave_room', {
    target_room_id: input.roomId,
    actor_client_id: input.actorClientId,
  })

  if (error) {
    throw new Error(getMessage(error))
  }

  return z.array(leaveRoomSchema).length(1).parse(data)[0]
}

export async function startRevealCountdown(input: {
  roomId: string
  actorClientId: string
}) {
  const { data, error } = await supabase.rpc('start_reveal_countdown', {
    target_room_id: input.roomId,
    actor_client_id: input.actorClientId,
  })

  if (error) {
    throw new Error(getMessage(error))
  }

  return z.array(revealCountdownSchema).length(1).parse(data)[0]
}

export async function revealRound(input: {
  roomId: string
  actorClientId: string
}) {
  const { data, error } = await supabase.rpc('reveal_round', {
    target_room_id: input.roomId,
    actor_client_id: input.actorClientId,
  })

  if (error) {
    throw new Error(getMessage(error))
  }

  return z.array(revealRoundSchema).length(1).parse(data)[0]
}

export async function resetRound(input: {
  roomId: string
  actorClientId: string
}) {
  const { data, error } = await supabase.rpc('reset_round', {
    target_room_id: input.roomId,
    actor_client_id: input.actorClientId,
  })

  if (error) {
    throw new Error(getMessage(error))
  }

  return z.array(resetRoundSchema).length(1).parse(data)[0]
}

export async function setRoomFunLevel(input: {
  roomId: string
  actorClientId: string
  nextFunLevel: RoomFunLevel
}) {
  const { data, error } = await supabase.rpc('set_room_fun_level', {
    target_room_id: input.roomId,
    actor_client_id: input.actorClientId,
    next_fun_level: input.nextFunLevel,
  })

  if (error) {
    throw new Error(getMessage(error))
  }

  return z.array(roomFunLevelSchema).length(1).parse(data)[0]
}
