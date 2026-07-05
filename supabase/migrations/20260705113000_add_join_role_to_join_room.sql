create or replace function public.join_room(
  requested_room_name text,
  participant_client_id text,
  participant_display_name text,
  participant_avatar_key text,
  participant_role text
)
returns table (
  result_participant_id uuid,
  result_room_id uuid,
  result_room_name text,
  result_display_name text,
  result_avatar_key text,
  result_role text,
  result_is_kicked boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_room_name text := btrim(requested_room_name);
  normalized_client_id text := btrim(participant_client_id);
  normalized_display_name text := btrim(participant_display_name);
  normalized_avatar_key text := btrim(participant_avatar_key);
  normalized_role text := nullif(btrim(participant_role), '');
  target_room_id uuid;
  conflicting_participant_id uuid;
  existing_participant_kicked boolean;
  target_round_id uuid;
begin
  if normalized_room_name is null or normalized_room_name = '' then
    raise exception 'Room name is required';
  end if;

  if normalized_client_id is null or normalized_client_id = '' then
    raise exception 'Client identity is required';
  end if;

  if normalized_display_name is null or normalized_display_name = '' then
    raise exception 'Display name is required';
  end if;

  if normalized_avatar_key is null or normalized_avatar_key = '' then
    raise exception 'Avatar is required';
  end if;

  if normalized_role is not null and normalized_role not in ('voter', 'spectator') then
    raise exception 'Role is invalid';
  end if;

  select created_room.result_room_id
  into target_room_id
  from public.create_or_get_room(normalized_room_name) as created_room;

  select participants.id
  into conflicting_participant_id
  from public.participants
  where participants.room_id = target_room_id
    and participants.display_name = normalized_display_name
    and participants.client_id <> normalized_client_id
    and participants.is_kicked = false
  limit 1;

  if conflicting_participant_id is not null then
    raise exception 'Display name is already in use for this room';
  end if;

  select participants.is_kicked
  into existing_participant_kicked
  from public.participants
  where participants.room_id = target_room_id
    and participants.client_id = normalized_client_id
  limit 1;

  if existing_participant_kicked then
    raise exception 'You were kicked from this room';
  end if;

  insert into public.participants (
    room_id,
    client_id,
    display_name,
    avatar_key,
    role,
    is_kicked
  )
  values (
    target_room_id,
    normalized_client_id,
    normalized_display_name,
    normalized_avatar_key,
    coalesce(normalized_role, 'voter'),
    false
  )
  on conflict (room_id, client_id) where is_kicked = false do update
    set display_name = excluded.display_name,
        avatar_key = excluded.avatar_key,
        role = coalesce(normalized_role, participants.role),
        is_kicked = false
  returning
    participants.id,
    participants.room_id,
    (select rooms.name from public.rooms where rooms.id = participants.room_id),
    participants.display_name,
    participants.avatar_key,
    participants.role,
    participants.is_kicked
  into
    result_participant_id,
    result_room_id,
    result_room_name,
    result_display_name,
    result_avatar_key,
    result_role,
    result_is_kicked;

  if result_role = 'spectator' then
    select rounds.id
    into target_round_id
    from public.rounds
    where rounds.room_id = target_room_id
      and rounds.status in ('voting', 'countdown')
    limit 1;

    if target_round_id is not null then
      delete from public.votes
      where votes.round_id = target_round_id
        and votes.participant_id = result_participant_id;
    end if;
  end if;

  return next;
end;
$$;

create or replace function public.join_room(
  requested_room_name text,
  participant_client_id text,
  participant_display_name text,
  participant_avatar_key text
)
returns table (
  result_participant_id uuid,
  result_room_id uuid,
  result_room_name text,
  result_display_name text,
  result_avatar_key text,
  result_role text,
  result_is_kicked boolean
)
language sql
security definer
set search_path = public
as $$
  select *
  from public.join_room(
    requested_room_name,
    participant_client_id,
    participant_display_name,
    participant_avatar_key,
    'voter'
  );
$$;

grant execute on function public.join_room(text, text, text, text, text) to anon, authenticated;
