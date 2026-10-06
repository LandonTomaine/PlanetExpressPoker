alter table public.votes
add column is_unsure boolean not null default false;

drop function public.submit_vote(uuid, text, text);

create function public.submit_vote(
  target_room_id uuid,
  participant_client_id text,
  selected_card_value text,
  selected_is_unsure boolean default false
)
returns table (
  result_round_id uuid,
  result_participant_id uuid,
  result_card_value text,
  result_is_unsure boolean,
  result_submitted_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_client_id text := btrim(participant_client_id);
  normalized_card_value text := btrim(selected_card_value);
  normalized_is_unsure boolean := coalesce(selected_is_unsure, false);
  target_participant_id uuid;
  target_round_id uuid;
  target_round_status text;
  target_participant_role text;
  target_is_kicked boolean;
begin
  if target_room_id is null then
    raise exception 'Room is required';
  end if;

  if normalized_client_id is null or normalized_client_id = '' then
    raise exception 'Client identity is required';
  end if;

  if normalized_card_value is null or normalized_card_value = '' then
    raise exception 'Card value is required';
  end if;

  select participants.id, participants.role, participants.is_kicked
  into target_participant_id, target_participant_role, target_is_kicked
  from public.participants
  where participants.room_id = target_room_id
    and participants.client_id = normalized_client_id
  limit 1;

  if target_participant_id is null then
    raise exception 'Participant was not found for this room';
  end if;

  if target_is_kicked then
    raise exception 'Kicked participants cannot vote';
  end if;

  if target_participant_role <> 'voter' then
    raise exception 'Only voters can submit a vote';
  end if;

  select rounds.id, rounds.status
  into target_round_id, target_round_status
  from public.rounds
  where rounds.room_id = target_room_id
  limit 1;

  if target_round_id is null then
    raise exception 'Active round was not found';
  end if;

  if target_round_status <> 'voting' then
    raise exception 'Votes can only be submitted while the round is hidden';
  end if;

  insert into public.votes (
    round_id,
    participant_id,
    card_value,
    is_unsure
  )
  values (
    target_round_id,
    target_participant_id,
    normalized_card_value,
    normalized_is_unsure
  )
  on conflict (round_id, participant_id) do update
    set card_value = excluded.card_value,
        is_unsure = excluded.is_unsure,
        submitted_at = timezone('utc', now())
  returning
    votes.round_id,
    votes.participant_id,
    votes.card_value,
    votes.is_unsure,
    votes.submitted_at
  into
    result_round_id,
    result_participant_id,
    result_card_value,
    result_is_unsure,
    result_submitted_at;

  return next;
end;
$$;

drop function public.list_round_votes(uuid, text);

create function public.list_round_votes(
  target_round_id uuid,
  actor_client_id text
)
returns table (
  round_id uuid,
  participant_id uuid,
  card_value text,
  is_unsure boolean,
  submitted_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := btrim(actor_client_id);
  target_room_id uuid;
  target_round_status text;
  actor_participant_id uuid;
  actor_is_kicked boolean;
begin
  if target_round_id is null then
    raise exception 'Round is required';
  end if;

  if normalized_actor_client_id is null or normalized_actor_client_id = '' then
    raise exception 'Actor identity is required';
  end if;

  select rounds.room_id, rounds.status
  into target_room_id, target_round_status
  from public.rounds
  where rounds.id = target_round_id
  limit 1;

  if target_room_id is null then
    raise exception 'Round was not found';
  end if;

  select participants.id, participants.is_kicked
  into actor_participant_id, actor_is_kicked
  from public.participants
  where participants.room_id = target_room_id
    and participants.client_id = normalized_actor_client_id
  limit 1;

  if actor_participant_id is null or actor_is_kicked then
    raise exception 'Only active room participants can read votes';
  end if;

  return query
  select
    votes.round_id,
    votes.participant_id,
    case
      when target_round_status = 'revealed'
        or votes.participant_id = actor_participant_id
      then votes.card_value
      else '__hidden__'
    end as card_value,
    case
      when target_round_status = 'revealed'
        or votes.participant_id = actor_participant_id
      then votes.is_unsure
      else false
    end as is_unsure,
    votes.submitted_at
  from public.votes
  where votes.round_id = target_round_id
  order by votes.submitted_at asc, votes.participant_id asc;
end;
$$;

grant execute on function public.submit_vote(uuid, text, text, boolean) to anon, authenticated;
grant execute on function public.list_round_votes(uuid, text) to anon, authenticated;
