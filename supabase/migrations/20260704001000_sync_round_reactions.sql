alter table public.rounds
  add column if not exists reaction_kind text,
  add column if not exists last_reaction_kind text;

do $$
begin
  alter table public.rounds
    add constraint rounds_reaction_kind_valid
      check (
        reaction_kind is null
        or reaction_kind in (
          'coffee1',
          'coffee2',
          'coffee3',
          'coffee4',
          'consensus1',
          'consensus2',
          'consensus3',
          'consensus4',
          'consensus5',
          'nibblerQuestion',
          'skepticalFry',
          'wideSpread1',
          'wideSpread2'
        )
      );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter table public.rounds
    add constraint rounds_last_reaction_kind_valid
      check (
        last_reaction_kind is null
        or last_reaction_kind in (
          'coffee1',
          'coffee2',
          'coffee3',
          'coffee4',
          'consensus1',
          'consensus2',
          'consensus3',
          'consensus4',
          'consensus5',
          'nibblerQuestion',
          'skepticalFry',
          'wideSpread1',
          'wideSpread2'
        )
      );
exception
  when duplicate_object then null;
end;
$$;

create or replace function public.pick_round_reaction_kind(
  target_round_id uuid,
  previous_reaction_kind text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  card_values text[] := array[]::text[];
  numeric_values text[] := array[]::text[];
  unique_numeric_card_indexes integer[] := array[]::integer[];
  candidate_reactions text[] := array[]::text[];
  first_numeric_card text;
  highest_card_index integer;
  lowest_card_index integer;
  has_exact_spread_gap boolean;
  selected_reaction_index integer;
begin
  if target_round_id is null then
    return null;
  end if;

  select coalesce(array_agg(votes.card_value order by votes.submitted_at asc, votes.participant_id asc), array[]::text[])
  into card_values
  from public.votes
  where votes.round_id = target_round_id;

  if cardinality(card_values) = 0 then
    return null;
  end if;

  if array['ship', 'BIG', 'nibbler', 'coffee'] <@ card_values then
    return null;
  end if;

  if 'coffee' = any(card_values) then
    candidate_reactions := array['coffee1', 'coffee2', 'coffee3', 'coffee4'];
  elsif 'nibbler' = any(card_values) then
    return 'nibblerQuestion';
  elsif 'ship' = any(card_values) then
    return null;
  elsif 'BIG' = any(card_values) then
    return 'skepticalFry';
  else
    select coalesce(array_agg(selected_cards.card_value order by selected_cards.ordinality), array[]::text[])
    into numeric_values
    from unnest(card_values) with ordinality as selected_cards(card_value, ordinality)
    where selected_cards.card_value in ('0', '1', '2', '3', '5', '8', '13');

    if cardinality(numeric_values) >= 2 then
      first_numeric_card := numeric_values[1];

      if not exists (
        select 1
        from unnest(numeric_values) as selected_numeric_cards(card_value)
        where selected_numeric_cards.card_value <> first_numeric_card
      ) then
        candidate_reactions := array[
          'consensus1',
          'consensus2',
          'consensus3',
          'consensus4',
          'consensus5'
        ];
      end if;
    end if;

    if cardinality(candidate_reactions) = 0 then
      select coalesce(array_agg(numeric_card_indexes.card_index order by numeric_card_indexes.card_index), array[]::integer[])
      into unique_numeric_card_indexes
      from (
        select distinct
          case selected_cards.card_value
            when '0' then 0
            when '1' then 1
            when '2' then 2
            when '3' then 3
            when '5' then 4
            when '8' then 5
            when '13' then 6
          end as card_index
        from unnest(card_values) as selected_cards(card_value)
        where selected_cards.card_value in ('0', '1', '2', '3', '5', '8', '13')
      ) as numeric_card_indexes;

      if cardinality(unique_numeric_card_indexes) between 2 and 4 then
        select coalesce(
          bool_or(
            unique_numeric_card_indexes[card_index_position] <>
              unique_numeric_card_indexes[card_index_position - 1] + 1
          ),
          false
        )
        into has_exact_spread_gap
        from generate_subscripts(unique_numeric_card_indexes, 1) as card_index_position
        where card_index_position > 1;

        if not has_exact_spread_gap then
          candidate_reactions := array['wideSpread1', 'wideSpread2'];
        end if;
      end if;

      if cardinality(candidate_reactions) = 0 and cardinality(unique_numeric_card_indexes) >= 2 then
        lowest_card_index := unique_numeric_card_indexes[1];
        highest_card_index := unique_numeric_card_indexes[cardinality(unique_numeric_card_indexes)];

        if highest_card_index - lowest_card_index > 1 then
          candidate_reactions := array['wideSpread1', 'wideSpread2'];
        end if;
      end if;
    end if;
  end if;

  if cardinality(candidate_reactions) = 0 then
    return null;
  end if;

  if cardinality(candidate_reactions) > 1 and previous_reaction_kind = any(candidate_reactions) then
    candidate_reactions := array_remove(candidate_reactions, previous_reaction_kind);
  end if;

  selected_reaction_index := floor(random() * cardinality(candidate_reactions))::integer + 1;

  return candidate_reactions[selected_reaction_index];
end;
$$;

create or replace function public.reveal_round(
  target_room_id uuid,
  actor_client_id text
)
returns table (
  result_round_id uuid,
  result_status text,
  result_revealed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := btrim(actor_client_id);
  actor_participant_id uuid;
  actor_is_kicked boolean;
  active_round_id uuid;
  next_reaction_kind text;
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
    raise exception 'Only active room participants can reveal';
  end if;

  select rounds.id
  into active_round_id
  from public.rounds
  where rounds.room_id = target_room_id
    and rounds.status in ('voting', 'countdown')
  limit 1;

  if active_round_id is not null and not exists (
    select 1
    from public.votes
    where votes.round_id = active_round_id
  ) then
    raise exception 'At least one vote is required before reveal';
  end if;

  select public.pick_round_reaction_kind(rounds.id, rounds.last_reaction_kind)
  into next_reaction_kind
  from public.rounds
  where rounds.id = active_round_id;

  update public.rounds
  set status = 'revealed',
      revealed_at = timezone('utc', now()),
      reaction_kind = next_reaction_kind,
      last_reaction_kind = coalesce(next_reaction_kind, rounds.last_reaction_kind)
  where rounds.room_id = target_room_id
    and rounds.status in ('voting', 'countdown')
  returning rounds.id, rounds.status, rounds.revealed_at, rounds.reaction_kind
  into result_round_id, result_status, result_revealed_at, next_reaction_kind;

  if result_round_id is null then
    select rounds.id, rounds.status, rounds.revealed_at
    into result_round_id, result_status, result_revealed_at
    from public.rounds
    where rounds.room_id = target_room_id
    limit 1;
  end if;

  return next;
end;
$$;

create or replace function public.reset_round(
  target_room_id uuid,
  actor_client_id text
)
returns table (
  result_round_id uuid,
  result_round_number integer,
  result_status text,
  result_countdown_started_at timestamptz,
  result_revealed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := btrim(actor_client_id);
  actor_participant_id uuid;
  actor_is_kicked boolean;
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
    raise exception 'Only active room participants can reset the round';
  end if;

  delete from public.votes
  using public.rounds
  where public.rounds.room_id = target_room_id
    and public.rounds.id = public.votes.round_id;

  update public.rounds
  set round_number = rounds.round_number + 1,
      status = 'voting',
      countdown_started_at = null,
      countdown_seconds = 3,
      revealed_at = null,
      reaction_kind = null
  where rounds.room_id = target_room_id
    and rounds.status = 'revealed'
  returning
    rounds.id,
    rounds.round_number,
    rounds.status,
    rounds.countdown_started_at,
    rounds.revealed_at
  into
    result_round_id,
    result_round_number,
    result_status,
    result_countdown_started_at,
    result_revealed_at;

  if result_round_id is null then
    select rounds.id, rounds.round_number, rounds.status, rounds.countdown_started_at, rounds.revealed_at
    into result_round_id, result_round_number, result_status, result_countdown_started_at, result_revealed_at
    from public.rounds
    where rounds.room_id = target_room_id
    limit 1;
  end if;

  return next;
end;
$$;

grant execute on function public.reveal_round(uuid, text) to anon, authenticated;
grant execute on function public.reset_round(uuid, text) to anon, authenticated;
