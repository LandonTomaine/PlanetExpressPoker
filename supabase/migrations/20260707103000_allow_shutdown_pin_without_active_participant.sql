create or replace function public.shutdown_room(
  target_room_id uuid,
  actor_client_id text,
  shutdown_pin text default null
)
returns table (
  result_room_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := nullif(btrim(actor_client_id), '');
  normalized_shutdown_pin text := nullif(btrim(shutdown_pin), '');
  actor_participant_id uuid;
  actor_is_kicked boolean;
  room_owner_participant_id uuid;
  configured_shutdown_pin_hash text;
  has_valid_shutdown_pin boolean := false;
  deleted_room_id uuid;
begin
  if target_room_id is null then
    raise exception 'Room is required';
  end if;

  if normalized_actor_client_id is null and normalized_shutdown_pin is null then
    raise exception 'Actor identity or shutdown PIN is required';
  end if;

  if normalized_shutdown_pin is not null then
    select app_secrets.secret_hash
    into configured_shutdown_pin_hash
    from public.app_secrets
    where app_secrets.name = 'room_shutdown_pin'
    limit 1;

    if configured_shutdown_pin_hash is not null then
      has_valid_shutdown_pin := encode(digest(normalized_shutdown_pin, 'sha256'), 'hex')
        = configured_shutdown_pin_hash;
    end if;
  end if;

  if normalized_actor_client_id is not null then
    select participants.id, participants.is_kicked
    into actor_participant_id, actor_is_kicked
    from public.participants
    where participants.room_id = target_room_id
      and participants.client_id = normalized_actor_client_id
    limit 1;
  end if;

  select participants.id
  into room_owner_participant_id
  from public.participants
  where participants.room_id = target_room_id
  order by participants.created_at asc, participants.id asc
  limit 1;

  if not has_valid_shutdown_pin then
    if actor_participant_id is null or actor_is_kicked then
      raise exception 'Only active room owners or valid shutdown PIN users can shut down a room';
    end if;

    if actor_participant_id <> room_owner_participant_id then
      if configured_shutdown_pin_hash is null then
        select app_secrets.secret_hash
        into configured_shutdown_pin_hash
        from public.app_secrets
        where app_secrets.name = 'room_shutdown_pin'
        limit 1;
      end if;

      if configured_shutdown_pin_hash is null then
        raise exception 'Shutdown PIN is not configured';
      end if;

      if normalized_shutdown_pin is null then
        raise exception 'Shutdown PIN is required';
      end if;

      raise exception 'Invalid shutdown PIN';
    end if;
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

grant execute on function public.shutdown_room(uuid, text, text) to anon, authenticated;
