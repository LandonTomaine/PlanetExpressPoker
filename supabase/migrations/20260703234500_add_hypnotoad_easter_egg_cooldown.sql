alter table public.room_settings
  add column hypnotoad_easter_egg_triggered_at timestamptz;

create or replace function public.trigger_hypnotoad_easter_egg(
  target_room_id uuid,
  actor_client_id text
)
returns table (
  result_room_id uuid,
  result_triggered boolean,
  result_triggered_at timestamptz,
  result_next_available_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := btrim(actor_client_id);
  actor_participant_id uuid;
  actor_is_kicked boolean;
  current_fun_level text;
  last_triggered_at timestamptz;
  next_available_at timestamptz;
  now_at timestamptz := statement_timestamp();
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
    raise exception 'Only active room participants can trigger Hypnotoad';
  end if;

  select room_settings.fun_level, room_settings.hypnotoad_easter_egg_triggered_at
  into current_fun_level, last_triggered_at
  from public.room_settings
  where room_settings.room_id = target_room_id
  for update;

  if current_fun_level is null then
    raise exception 'Room settings were not found';
  end if;

  if current_fun_level <> 'chaotic' then
    raise exception 'Effects are disabled';
  end if;

  if last_triggered_at is not null then
    next_available_at := last_triggered_at + interval '1 hour';

    if next_available_at > now_at then
      result_room_id := target_room_id;
      result_triggered := false;
      result_triggered_at := last_triggered_at;
      result_next_available_at := next_available_at;
      return next;
      return;
    end if;
  end if;

  update public.room_settings
  set hypnotoad_easter_egg_triggered_at = now_at
  where room_settings.room_id = target_room_id
  returning room_settings.room_id, room_settings.hypnotoad_easter_egg_triggered_at
  into result_room_id, result_triggered_at;

  result_triggered := true;
  result_next_available_at := now_at + interval '1 hour';

  return next;
end;
$$;

grant execute on function public.trigger_hypnotoad_easter_egg(uuid, text) to anon, authenticated;
