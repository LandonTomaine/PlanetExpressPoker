import { beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '../../../lib/supabase/client'
import { listVotes, submitVote } from './roomApi'

vi.mock('../../../lib/supabase/client', () => ({
  supabase: { rpc: vi.fn() },
}))

const submittedAt = '2026-11-03T12:00:00Z'
const confidenceCases = [
  { label: 'Default', isUnsure: false, isSure: false },
  { label: 'Unsure', isUnsure: true, isSure: false },
  { label: 'Sure', isUnsure: false, isSure: true },
]

describe('vote confidence API', () => {
  beforeEach(() => vi.clearAllMocks())

  it.each(confidenceCases)(
    'submits and maps $label confidence',
    async ({ isUnsure, isSure }) => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [
          {
            result_round_id: '10000000-0000-4000-8000-000000000001',
            result_participant_id: '20000000-0000-4000-8000-000000000001',
            result_card_value: '5',
            result_is_unsure: isUnsure,
            result_is_sure: isSure,
            result_submitted_at: submittedAt,
          },
        ],
        error: null,
      } as Awaited<ReturnType<typeof supabase.rpc>>)

      await expect(
        submitVote({
          roomId: 'room-1',
          clientId: 'client-1',
          cardValue: '5',
          isUnsure,
          isSure,
        })
      ).resolves.toEqual({
        roundId: '10000000-0000-4000-8000-000000000001',
        participantId: '20000000-0000-4000-8000-000000000001',
        cardValue: '5',
        isUnsure,
        isSure,
        submittedAt,
      })
      expect(supabase.rpc).toHaveBeenCalledWith('submit_vote', {
        target_room_id: 'room-1',
        participant_client_id: 'client-1',
        selected_card_value: '5',
        selected_is_unsure: isUnsure,
        selected_is_sure: isSure,
      })
    }
  )

  it('maps revealed confidence and hidden votes from the room RPC', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [
        {
          round_id: '10000000-0000-4000-8000-000000000001',
          participant_id: '20000000-0000-4000-8000-000000000001',
          card_value: '5',
          is_unsure: false,
          is_sure: true,
          submitted_at: submittedAt,
        },
        {
          round_id: '10000000-0000-4000-8000-000000000001',
          participant_id: '20000000-0000-4000-8000-000000000002',
          card_value: '__hidden__',
          is_unsure: false,
          is_sure: false,
          submitted_at: submittedAt,
        },
      ],
      error: null,
    } as Awaited<ReturnType<typeof supabase.rpc>>)

    await expect(
      listVotes({
        roundId: '10000000-0000-4000-8000-000000000001',
        actorClientId: 'client-1',
      })
    ).resolves.toEqual([
      {
        roundId: '10000000-0000-4000-8000-000000000001',
        participantId: '20000000-0000-4000-8000-000000000001',
        cardValue: '5',
        isUnsure: false,
        isSure: true,
        submittedAt,
      },
      {
        roundId: '10000000-0000-4000-8000-000000000001',
        participantId: '20000000-0000-4000-8000-000000000002',
        cardValue: '__hidden__',
        isUnsure: false,
        isSure: false,
        submittedAt,
      },
    ])
    expect(supabase.rpc).toHaveBeenCalledWith('list_round_votes', {
      target_round_id: '10000000-0000-4000-8000-000000000001',
      actor_client_id: 'client-1',
    })
  })
})
