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
  deleted_participant_id uuid;
begin
  if target_room_id is null then
    raise exception 'Room is required';
  end if;

  if normalized_actor_client_id is null or normalized_actor_client_id = '' then
    raise exception 'Actor identity is required';
  end if;

  delete from public.participants
  where participants.room_id = target_room_id
    and participants.client_id = normalized_actor_client_id
    and participants.is_kicked = false
  returning participants.id
  into deleted_participant_id;

  if deleted_participant_id is null then
    raise exception 'Active participant was not found';
  end if;

  result_participant_id := deleted_participant_id;

  return next;
end;
$$;

grant execute on function public.leave_room(uuid, text) to anon, authenticated;
