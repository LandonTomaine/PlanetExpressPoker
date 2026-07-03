create or replace function public.set_participant_role(
  target_room_id uuid,
  actor_client_id text,
  target_participant_id uuid,
  next_role text
)
returns table (
  result_participant_id uuid,
  result_role text,
  result_is_kicked boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := btrim(actor_client_id);
  normalized_next_role text := btrim(next_role);
  actor_participant_id uuid;
  actor_is_kicked boolean;
  target_round_id uuid;
begin
  if target_room_id is null then
    raise exception 'Room is required';
  end if;

  if normalized_actor_client_id is null or normalized_actor_client_id = '' then
    raise exception 'Actor identity is required';
  end if;

  if target_participant_id is null then
    raise exception 'Target participant is required';
  end if;

  if normalized_next_role not in ('voter', 'spectator') then
    raise exception 'Role is invalid';
  end if;

  select participants.id, participants.is_kicked
  into actor_participant_id, actor_is_kicked
  from public.participants
  where participants.room_id = target_room_id
    and participants.client_id = normalized_actor_client_id
  limit 1;

  if actor_participant_id is null or actor_is_kicked then
    raise exception 'Only active room participants can change roles';
  end if;

  update public.participants
  set role = normalized_next_role
  where participants.room_id = target_room_id
    and participants.id = target_participant_id
    and participants.is_kicked = false
  returning participants.id, participants.role, participants.is_kicked
  into result_participant_id, result_role, result_is_kicked;

  if result_participant_id is null then
    raise exception 'Target participant was not found';
  end if;

  if normalized_next_role = 'spectator' then
    select rounds.id
    into target_round_id
    from public.rounds
    where rounds.room_id = target_room_id
      and rounds.status in ('voting', 'countdown')
    limit 1;

    if target_round_id is not null then
      delete from public.votes
      where votes.round_id = target_round_id
        and votes.participant_id = target_participant_id;
    end if;
  end if;

  return next;
end;
$$;

create or replace function public.kick_participant(
  target_room_id uuid,
  actor_client_id text,
  target_participant_id uuid
)
returns table (
  result_participant_id uuid,
  result_is_kicked boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := btrim(actor_client_id);
  actor_participant_id uuid;
  actor_is_kicked boolean;
  room_owner_participant_id uuid;
  target_round_id uuid;
begin
  if target_room_id is null then
    raise exception 'Room is required';
  end if;

  if normalized_actor_client_id is null or normalized_actor_client_id = '' then
    raise exception 'Actor identity is required';
  end if;

  if target_participant_id is null then
    raise exception 'Target participant is required';
  end if;

  select participants.id, participants.is_kicked
  into actor_participant_id, actor_is_kicked
  from public.participants
  where participants.room_id = target_room_id
    and participants.client_id = normalized_actor_client_id
  limit 1;

  if actor_participant_id is null or actor_is_kicked then
    raise exception 'Only active room participants can kick people';
  end if;

  select participants.id
  into room_owner_participant_id
  from public.participants
  where participants.room_id = target_room_id
    and participants.is_kicked = false
  order by participants.created_at asc, participants.id asc
  limit 1;

  if target_participant_id = room_owner_participant_id then
    raise exception 'Room owner cannot be removed';
  end if;

  update public.participants
  set is_kicked = true
  where participants.room_id = target_room_id
    and participants.id = target_participant_id
    and participants.is_kicked = false
  returning participants.id, participants.is_kicked
  into result_participant_id, result_is_kicked;

  if result_participant_id is null then
    raise exception 'Target participant was not found';
  end if;

  select rounds.id
  into target_round_id
  from public.rounds
  where rounds.room_id = target_room_id
    and rounds.status in ('voting', 'countdown')
  limit 1;

  if target_round_id is not null then
    delete from public.votes
    where votes.round_id = target_round_id
      and votes.participant_id = target_participant_id;
  end if;

  return next;
end;
$$;

create or replace function public.reveal_round(
  target_room_id uuid
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
begin
  if target_room_id is null then
    raise exception 'Room is required';
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

grant execute on function public.set_participant_role(uuid, text, uuid, text) to anon, authenticated;
grant execute on function public.kick_participant(uuid, text, uuid) to anon, authenticated;
grant execute on function public.reveal_round(uuid) to anon, authenticated;
