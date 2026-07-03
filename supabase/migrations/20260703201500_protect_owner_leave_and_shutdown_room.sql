create or replace function public.leave_room(
  target_room_id uuid,
  actor_client_id text
)
returns table (
  result_participant_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := btrim(actor_client_id);
  actor_participant_id uuid;
  room_owner_participant_id uuid;
  deleted_participant_id uuid;
begin
  if target_room_id is null then
    raise exception 'Room is required';
  end if;

  if normalized_actor_client_id is null or normalized_actor_client_id = '' then
    raise exception 'Actor identity is required';
  end if;

  select participants.id
  into actor_participant_id
  from public.participants
  where participants.room_id = target_room_id
    and participants.client_id = normalized_actor_client_id
    and participants.is_kicked = false
  limit 1;

  if actor_participant_id is null then
    raise exception 'Active participant was not found';
  end if;

  select participants.id
  into room_owner_participant_id
  from public.participants
  where participants.room_id = target_room_id
  order by participants.created_at asc, participants.id asc
  limit 1;

  if actor_participant_id = room_owner_participant_id then
    raise exception 'Room owner cannot leave. Shut down the room instead.';
  end if;

  delete from public.participants
  where participants.id = actor_participant_id
  returning participants.id
  into deleted_participant_id;

  result_participant_id := deleted_participant_id;

  return next;
end;
$$;

create or replace function public.shutdown_room(
  target_room_id uuid,
  actor_client_id text
)
returns table (
  result_room_id uuid
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
  deleted_room_id uuid;
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
    raise exception 'Only active room participants can shut down a room';
  end if;

  select participants.id
  into room_owner_participant_id
  from public.participants
  where participants.room_id = target_room_id
  order by participants.created_at asc, participants.id asc
  limit 1;

  if actor_participant_id <> room_owner_participant_id then
    raise exception 'Only the room owner can shut down this room';
  end if;

  delete from public.rooms
  where rooms.id = target_room_id
  returning rooms.id
  into deleted_room_id;

  if deleted_room_id is null then
    raise exception 'Room was not found';
  end if;

  result_room_id := deleted_room_id;

  return next;
end;
$$;

grant execute on function public.leave_room(uuid, text) to anon, authenticated;
grant execute on function public.shutdown_room(uuid, text) to anon, authenticated;
