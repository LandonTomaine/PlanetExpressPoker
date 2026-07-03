create or replace function public.start_reveal_countdown(
  target_room_id uuid,
  actor_client_id text
)
returns table (
  result_round_id uuid,
  result_status text,
  result_countdown_started_at timestamptz,
  result_countdown_seconds integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := btrim(actor_client_id);
  actor_participant_id uuid;
  actor_is_kicked boolean;
  active_round_id uuid;
begin
  if target_room_id is null then
    raise exception 'Room is required';
  end if;

  if normalized_actor_client_id is null or normalized_actor_client_id = '' then
    raise exception 'Actor identity is required';
  end if;

  select participants.id, participants.is_kicked
  into actor_participant_id, actor_is_kicked
  from public.participants
  where participants.room_id = target_room_id
    and participants.client_id = normalized_actor_client_id
  limit 1;

  if actor_participant_id is null or actor_is_kicked then
    raise exception 'Only active room participants can reveal';
  end if;

  select rounds.id
  into active_round_id
  from public.rounds
  where rounds.room_id = target_room_id
    and rounds.status = 'voting'
  limit 1;

  if active_round_id is not null and not exists (
    select 1
    from public.votes
    where votes.round_id = active_round_id
  ) then
    raise exception 'At least one vote is required before reveal';
  end if;

  update public.rounds
  set status = 'countdown',
      countdown_started_at = timezone('utc', now())
  where rounds.room_id = target_room_id
    and rounds.status = 'voting'
  returning
    rounds.id,
    rounds.status,
    rounds.countdown_started_at,
    rounds.countdown_seconds
  into
    result_round_id,
    result_status,
    result_countdown_started_at,
    result_countdown_seconds;

  if result_round_id is null then
    select rounds.id, rounds.status, rounds.countdown_started_at, rounds.countdown_seconds
    into result_round_id, result_status, result_countdown_started_at, result_countdown_seconds
    from public.rounds
    where rounds.room_id = target_room_id
    limit 1;
  end if;

  return next;
end;
$$;

create or replace function public.reveal_round(
  target_room_id uuid,
  actor_client_id text
)
returns table (
  result_round_id uuid,
  result_status text,
  result_revealed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := btrim(actor_client_id);
  actor_participant_id uuid;
  actor_is_kicked boolean;
  active_round_id uuid;
begin
  if target_room_id is null then
    raise exception 'Room is required';
  end if;

  if normalized_actor_client_id is null or normalized_actor_client_id = '' then
    raise exception 'Actor identity is required';
  end if;

  select participants.id, participants.is_kicked
  into actor_participant_id, actor_is_kicked
  from public.participants
  where participants.room_id = target_room_id
    and participants.client_id = normalized_actor_client_id
  limit 1;

  if actor_participant_id is null or actor_is_kicked then
    raise exception 'Only active room participants can reveal';
  end if;

  select rounds.id
  into active_round_id
  from public.rounds
  where rounds.room_id = target_room_id
    and rounds.status in ('voting', 'countdown')
  limit 1;

  if active_round_id is not null and not exists (
    select 1
    from public.votes
    where votes.round_id = active_round_id
  ) then
    raise exception 'At least one vote is required before reveal';
  end if;

  update public.rounds
  set status = 'revealed',
      revealed_at = timezone('utc', now())
  where rounds.room_id = target_room_id
    and rounds.status in ('voting', 'countdown')
  returning rounds.id, rounds.status, rounds.revealed_at
  into result_round_id, result_status, result_revealed_at;

  if result_round_id is null then
    select rounds.id, rounds.status, rounds.revealed_at
    into result_round_id, result_status, result_revealed_at
    from public.rounds
    where rounds.room_id = target_room_id
    limit 1;
  end if;

  return next;
end;
$$;

grant execute on function public.start_reveal_countdown(uuid, text) to anon, authenticated;
grant execute on function public.reveal_round(uuid, text) to anon, authenticated;
