drop function if exists public.create_or_get_room(text);

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
  normalized_requested_theme text := coalesce(
    nullif(btrim(requested_theme), ''),
    'futurama'
  );
  target_room_id uuid;
  created_room_id uuid;
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

  if normalized_requested_theme not in ('futurama', 'zootopia') then
    raise exception 'Theme is invalid';
  end if;

  insert into public.rooms (name)
  values (normalized_room_name)
  on conflict (name) do nothing
  returning rooms.id, rooms.name, rooms.created_at, rooms.updated_at
  into
    target_room_id,
    create_or_get_room.result_room_name,
    result_room_created_at,
    result_room_updated_at;

  created_room_id := target_room_id;

  if target_room_id is null then
    select rooms.id, rooms.name, rooms.created_at, rooms.updated_at
    into
      target_room_id,
      create_or_get_room.result_room_name,
      result_room_created_at,
      result_room_updated_at
    from public.rooms
    where rooms.name = normalized_room_name
    limit 1;
  end if;

  create_or_get_room.result_room_id := target_room_id;

  if created_room_id is not null then
    insert into public.room_settings (room_id, theme)
    values (target_room_id, normalized_requested_theme)
    on conflict (room_id) do nothing;
  else
    insert into public.room_settings (room_id)
    values (target_room_id)
    on conflict (room_id) do nothing;
  end if;

  insert into public.rounds (room_id)
  values (target_room_id)
  on conflict (room_id) do nothing;

  return next;
end;
$$;

grant execute on function public.create_or_get_room(text, text) to anon, authenticated;
