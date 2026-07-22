alter table public.room_settings
drop constraint room_settings_theme_valid;

alter table public.room_settings
add constraint room_settings_theme_valid
check (theme in ('futurama', 'zootopia', 'toy-story'));

create or replace function public.set_room_theme(
  target_room_id uuid,
  actor_client_id text,
  next_theme text
)
returns table (
  result_room_id uuid,
  result_theme text,
  result_updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := btrim(actor_client_id);
  normalized_next_theme text := btrim(next_theme);
  actor_participant_id uuid;
  actor_is_kicked boolean;
  room_owner_participant_id uuid;
begin
  if target_room_id is null then raise exception 'Room is required'; end if;
  if normalized_actor_client_id is null or normalized_actor_client_id = '' then raise exception 'Actor identity is required'; end if;
  if normalized_next_theme not in ('futurama', 'zootopia', 'toy-story') then raise exception 'Theme is invalid'; end if;

  select participants.id, participants.is_kicked into actor_participant_id, actor_is_kicked
  from public.participants where participants.room_id = target_room_id and participants.client_id = normalized_actor_client_id limit 1;
  if actor_participant_id is null or actor_is_kicked then raise exception 'Only active room participants can change theme'; end if;

  select participants.id into room_owner_participant_id from public.participants
  where participants.room_id = target_room_id order by participants.created_at asc, participants.id asc limit 1;
  if actor_participant_id <> room_owner_participant_id then raise exception 'Only the room owner can change theme'; end if;

  update public.room_settings set theme = normalized_next_theme where room_settings.room_id = target_room_id
  returning room_settings.room_id, room_settings.theme, room_settings.updated_at
  into result_room_id, result_theme, result_updated_at;
  if result_room_id is null then raise exception 'Room settings were not found'; end if;
  return next;
end;
$$;

create or replace function public.create_or_get_room(
  requested_room_name text,
  requested_theme text default 'futurama'
)
returns table (
  result_room_id uuid,
  result_room_name text,
  result_room_created_at timestamptz,
  result_room_updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_room_name text := btrim(requested_room_name);
  normalized_requested_theme text := coalesce(nullif(btrim(requested_theme), ''), 'futurama');
  target_room_id uuid;
  created_room_id uuid;
begin
  if normalized_room_name is null or normalized_room_name = '' then raise exception 'Room name is required'; end if;
  if length(normalized_room_name) > 75 then raise exception 'Room names can be up to 75 characters'; end if;
  if normalized_room_name !~ '^[A-Za-z0-9_-]+$' then raise exception 'Use letters, numbers, hyphen, or underscore only'; end if;
  if normalized_requested_theme not in ('futurama', 'zootopia', 'toy-story') then raise exception 'Theme is invalid'; end if;

  insert into public.rooms (name) values (normalized_room_name) on conflict (name) do nothing
  returning rooms.id, rooms.name, rooms.created_at, rooms.updated_at
  into target_room_id, create_or_get_room.result_room_name, result_room_created_at, result_room_updated_at;
  created_room_id := target_room_id;
  if target_room_id is null then
    select rooms.id, rooms.name, rooms.created_at, rooms.updated_at into target_room_id, create_or_get_room.result_room_name, result_room_created_at, result_room_updated_at
    from public.rooms where rooms.name = normalized_room_name limit 1;
  end if;
  create_or_get_room.result_room_id := target_room_id;
  if created_room_id is not null then
    insert into public.room_settings (room_id, theme) values (target_room_id, normalized_requested_theme) on conflict (room_id) do nothing;
  else
    insert into public.room_settings (room_id) values (target_room_id) on conflict (room_id) do nothing;
  end if;
  insert into public.rounds (room_id) values (target_room_id) on conflict (room_id) do nothing;
  return next;
end;
$$;

grant execute on function public.set_room_theme(uuid, text, text) to anon, authenticated;
grant execute on function public.create_or_get_room(text, text) to anon, authenticated;
