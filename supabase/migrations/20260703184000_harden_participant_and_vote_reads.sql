drop policy if exists "participants are readable by anon" on public.participants;
drop policy if exists "votes are readable by anon" on public.votes;

revoke select on public.participants from anon, authenticated;
revoke select on public.votes from anon, authenticated;

create or replace function public.list_room_participants(target_room_id uuid)
returns table (
  id uuid,
  room_id uuid,
  display_name text,
  avatar_key text,
  role text,
  is_kicked boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_room_id is null then
    raise exception 'Room is required';
  end if;

  return query
  select
    participants.id,
    participants.room_id,
    participants.display_name,
    participants.avatar_key,
    participants.role,
    participants.is_kicked,
    participants.created_at
  from public.participants
  where participants.room_id = target_room_id
    and participants.is_kicked = false
  order by participants.created_at asc, participants.id asc;
end;
$$;

create or replace function public.list_round_votes(
  target_round_id uuid,
  actor_client_id text
)
returns table (
  round_id uuid,
  participant_id uuid,
  card_value text,
  submitted_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := btrim(actor_client_id);
  target_room_id uuid;
  target_round_status text;
  actor_participant_id uuid;
  actor_is_kicked boolean;
begin
  if target_round_id is null then
    raise exception 'Round is required';
  end if;

  if normalized_actor_client_id is null or normalized_actor_client_id = '' then
    raise exception 'Actor identity is required';
  end if;

  select rounds.room_id, rounds.status
  into target_room_id, target_round_status
  from public.rounds
  where rounds.id = target_round_id
  limit 1;

  if target_room_id is null then
    raise exception 'Round was not found';
  end if;

  select participants.id, participants.is_kicked
  into actor_participant_id, actor_is_kicked
  from public.participants
  where participants.room_id = target_room_id
    and participants.client_id = normalized_actor_client_id
  limit 1;

  if actor_participant_id is null or actor_is_kicked then
    raise exception 'Only active room participants can read votes';
  end if;

  return query
  select
    votes.round_id,
    votes.participant_id,
    case
      when target_round_status = 'revealed'
        or votes.participant_id = actor_participant_id
      then votes.card_value
      else '__hidden__'
    end as card_value,
    votes.submitted_at
  from public.votes
  where votes.round_id = target_round_id
  order by votes.submitted_at asc, votes.participant_id asc;
end;
$$;

grant execute on function public.list_room_participants(uuid) to anon, authenticated;
grant execute on function public.list_round_votes(uuid, text) to anon, authenticated;
