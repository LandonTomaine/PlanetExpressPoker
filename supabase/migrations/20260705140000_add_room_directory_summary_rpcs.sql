create or replace function public.list_rooms(
  target_page_size integer default 25,
  target_page_offset integer default 0,
  actor_client_id text default null
)
returns table (
  room_id uuid,
  room_name text,
  participant_count integer,
  current_client_role text,
  current_client_is_owner boolean,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := nullif(btrim(actor_client_id), '');
  normalized_page_size integer := least(greatest(coalesce(target_page_size, 25), 1), 100);
  normalized_page_offset integer := greatest(coalesce(target_page_offset, 0), 0);
begin
  return query
  with paged_rooms as (
    select rooms.id, rooms.name, rooms.updated_at
    from public.rooms
    where rooms.name not like 'dev\_%' escape '\'
    order by rooms.updated_at desc, rooms.name asc
    limit normalized_page_size
    offset normalized_page_offset
  ),
  participant_counts as (
    select participants.room_id, count(*)::integer as participant_count
    from public.participants
    join paged_rooms on paged_rooms.id = participants.room_id
    where participants.is_kicked = false
    group by participants.room_id
  )
  select
    paged_rooms.id,
    paged_rooms.name,
    coalesce(participant_counts.participant_count, 0) as participant_count,
    current_participant.role,
    coalesce(
      current_participant.id is not null
      and owner_participant.client_id = normalized_actor_client_id,
      false
    ) as current_client_is_owner,
    paged_rooms.updated_at
  from paged_rooms
  left join participant_counts
    on participant_counts.room_id = paged_rooms.id
  left join lateral (
    select participants.id, participants.role
    from public.participants
    where participants.room_id = paged_rooms.id
      and participants.client_id = normalized_actor_client_id
      and participants.is_kicked = false
    order by participants.created_at desc, participants.id desc
    limit 1
  ) as current_participant on true
  left join lateral (
    select participants.client_id
    from public.participants
    where participants.room_id = paged_rooms.id
      and participants.is_kicked = false
    order by participants.created_at asc, participants.id asc
    limit 1
  ) as owner_participant on true
  order by paged_rooms.updated_at desc, paged_rooms.name asc;
end;
$$;

create or replace function public.list_client_rooms(actor_client_id text)
returns table (
  room_id uuid,
  room_name text,
  participant_count integer,
  current_client_role text,
  current_client_is_owner boolean,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := btrim(actor_client_id);
begin
  if normalized_actor_client_id is null or normalized_actor_client_id = '' then
    raise exception 'Actor identity is required';
  end if;

  return query
  with client_rooms as (
    select
      rooms.id,
      rooms.name,
      rooms.updated_at,
      participants.role
    from public.rooms
    join public.participants
      on participants.room_id = rooms.id
    where participants.client_id = normalized_actor_client_id
      and participants.is_kicked = false
      and rooms.name not like 'dev\_%' escape '\'
    order by rooms.updated_at desc, rooms.name asc
  ),
  participant_counts as (
    select participants.room_id, count(*)::integer as participant_count
    from public.participants
    join client_rooms on client_rooms.id = participants.room_id
    where participants.is_kicked = false
    group by participants.room_id
  )
  select
    client_rooms.id,
    client_rooms.name,
    coalesce(participant_counts.participant_count, 0) as participant_count,
    client_rooms.role,
    coalesce(owner_participant.client_id = normalized_actor_client_id, false),
    client_rooms.updated_at
  from client_rooms
  left join participant_counts
    on participant_counts.room_id = client_rooms.id
  left join lateral (
    select participants.client_id
    from public.participants
    where participants.room_id = client_rooms.id
      and participants.is_kicked = false
    order by participants.created_at asc, participants.id asc
    limit 1
  ) as owner_participant on true
  order by client_rooms.updated_at desc, client_rooms.name asc;
end;
$$;

grant execute on function public.list_rooms(integer, integer, text) to anon, authenticated;
grant execute on function public.list_client_rooms(text) to anon, authenticated;
