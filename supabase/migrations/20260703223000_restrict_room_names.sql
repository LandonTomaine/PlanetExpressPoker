alter table public.rooms
  add constraint rooms_name_slug_format
  check (name ~ '^[A-Za-z0-9_-]{1,75}$')
  not valid;

create or replace function public.create_or_get_room(requested_room_name text)
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
  target_room_id uuid;
begin
  if normalized_room_name is null or normalized_room_name = '' then
    raise exception 'Room name is required';
  end if;

  if length(normalized_room_name) > 75 then
    raise exception 'Room names can be up to 75 characters';
  end if;

  if normalized_room_name !~ '^[A-Za-z0-9_-]+$' then
    raise exception 'Use letters, numbers, hyphen, or underscore only';
  end if;

  insert into public.rooms (name)
  values (normalized_room_name)
  on conflict (name) do update
    set updated_at = public.rooms.updated_at
  returning rooms.id, rooms.name, rooms.created_at, rooms.updated_at
  into
    target_room_id,
    create_or_get_room.result_room_name,
    result_room_created_at,
    result_room_updated_at;

  create_or_get_room.result_room_id := target_room_id;

  insert into public.room_settings (room_id)
  values (target_room_id)
  on conflict (room_id) do nothing;

  insert into public.rounds (room_id)
  values (target_room_id)
  on conflict (room_id) do nothing;

  return query
  select r.id, r.name, r.created_at, r.updated_at
  from public.rooms as r
  where r.id = target_room_id;
end;
$$;

grant execute on function public.create_or_get_room(text) to anon, authenticated;
