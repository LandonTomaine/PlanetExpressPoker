create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint rooms_name_not_blank check (btrim(name) <> '')
);

create table public.room_settings (
  room_id uuid primary key references public.rooms(id) on delete cascade,
  deck_type text not null default 'fibonacci',
  special_cards_enabled boolean not null default false,
  special_cards jsonb not null default '[]'::jsonb,
  auto_reveal_enabled boolean not null default true,
  reveal_countdown_enabled boolean not null default true,
  reveal_countdown_seconds integer not null default 3,
  fun_level text not null default 'chaotic',
  updated_at timestamptz not null default timezone('utc', now()),
  constraint room_settings_deck_type_valid check (deck_type in ('fibonacci')),
  constraint room_settings_fun_level_valid check (fun_level in ('disabled', 'chaotic')),
  constraint room_settings_reveal_seconds_valid check (reveal_countdown_seconds between 1 and 10),
  constraint room_settings_special_cards_array check (jsonb_typeof(special_cards) = 'array')
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  client_id text not null,
  display_name text not null,
  avatar_key text not null,
  role text not null default 'voter',
  is_kicked boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint participants_role_valid check (role in ('voter', 'spectator')),
  constraint participants_display_name_not_blank check (btrim(display_name) <> ''),
  constraint participants_avatar_key_not_blank check (btrim(avatar_key) <> ''),
  constraint participants_client_id_not_blank check (btrim(client_id) <> '')
);

create table public.rounds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null unique references public.rooms(id) on delete cascade,
  round_number integer not null default 1,
  status text not null default 'voting',
  countdown_started_at timestamptz,
  countdown_seconds integer not null default 3,
  revealed_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint rounds_status_valid check (status in ('voting', 'countdown', 'revealed')),
  constraint rounds_round_number_positive check (round_number > 0),
  constraint rounds_countdown_seconds_valid check (countdown_seconds between 1 and 10)
);

create table public.votes (
  round_id uuid not null references public.rounds(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  card_value text not null,
  submitted_at timestamptz not null default timezone('utc', now()),
  primary key (round_id, participant_id),
  constraint votes_card_value_not_blank check (btrim(card_value) <> '')
);

create index participants_room_id_idx on public.participants (room_id);
create index participants_room_id_is_kicked_idx on public.participants (room_id, is_kicked);
create index votes_participant_id_idx on public.votes (participant_id);
create unique index participants_room_display_name_active_idx
on public.participants (room_id, display_name)
where is_kicked = false;
create unique index participants_room_client_id_active_idx
on public.participants (room_id, client_id)
where is_kicked = false;

create trigger rooms_set_updated_at
before update on public.rooms
for each row
execute function public.set_updated_at();

create trigger room_settings_set_updated_at
before update on public.room_settings
for each row
execute function public.set_updated_at();

create trigger participants_set_updated_at
before update on public.participants
for each row
execute function public.set_updated_at();

create trigger rounds_set_updated_at
before update on public.rounds
for each row
execute function public.set_updated_at();

alter publication supabase_realtime add table public.participants;
alter publication supabase_realtime add table public.votes;
alter publication supabase_realtime add table public.rounds;
alter publication supabase_realtime add table public.room_settings;

alter table public.rooms enable row level security;
alter table public.room_settings enable row level security;
alter table public.participants enable row level security;
alter table public.rounds enable row level security;
alter table public.votes enable row level security;

create policy "rooms are readable by anon"
on public.rooms
for select
to anon, authenticated
using (true);

create policy "room settings are readable by anon"
on public.room_settings
for select
to anon, authenticated
using (true);

create policy "participants are readable by anon"
on public.participants
for select
to anon, authenticated
using (not is_kicked);

create policy "rounds are readable by anon"
on public.rounds
for select
to anon, authenticated
using (true);

create policy "votes are readable by anon"
on public.votes
for select
to anon, authenticated
using (true);

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
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_room_name text := btrim(requested_room_name);
  normalized_client_id text := btrim(participant_client_id);
  normalized_display_name text := btrim(participant_display_name);
  normalized_avatar_key text := btrim(participant_avatar_key);
  target_room_id uuid;
  conflicting_participant_id uuid;
  existing_participant_kicked boolean;
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
    'voter',
    false
  )
  on conflict (room_id, client_id) where is_kicked = false do update
    set display_name = excluded.display_name,
        avatar_key = excluded.avatar_key,
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

  return next;
end;
$$;

create or replace function public.set_participant_role(
  target_room_id uuid,
  actor_client_id text,
  target_participant_id uuid,
  next_role text
)
returns table (
  result_participant_id uuid,
  result_role text,
  result_is_kicked boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := btrim(actor_client_id);
  normalized_next_role text := btrim(next_role);
  actor_participant_id uuid;
  actor_is_kicked boolean;
  target_round_id uuid;
begin
  if target_room_id is null then
    raise exception 'Room is required';
  end if;

  if normalized_actor_client_id is null or normalized_actor_client_id = '' then
    raise exception 'Actor identity is required';
  end if;

  if target_participant_id is null then
    raise exception 'Target participant is required';
  end if;

  if normalized_next_role not in ('voter', 'spectator') then
    raise exception 'Role is invalid';
  end if;

  select participants.id, participants.is_kicked
  into actor_participant_id, actor_is_kicked
  from public.participants
  where participants.room_id = target_room_id
    and participants.client_id = normalized_actor_client_id
  limit 1;

  if actor_participant_id is null or actor_is_kicked then
    raise exception 'Only active room participants can change roles';
  end if;

  update public.participants
  set role = normalized_next_role
  where participants.room_id = target_room_id
    and participants.id = target_participant_id
    and participants.is_kicked = false
  returning participants.id, participants.role, participants.is_kicked
  into result_participant_id, result_role, result_is_kicked;

  if result_participant_id is null then
    raise exception 'Target participant was not found';
  end if;

  if normalized_next_role = 'spectator' then
    select rounds.id
    into target_round_id
    from public.rounds
    where rounds.room_id = target_room_id
    limit 1;

    if target_round_id is not null then
      delete from public.votes
      where votes.round_id = target_round_id
        and votes.participant_id = target_participant_id;
    end if;
  end if;

  return next;
end;
$$;

create or replace function public.submit_vote(
  target_room_id uuid,
  participant_client_id text,
  selected_card_value text
)
returns table (
  result_round_id uuid,
  result_participant_id uuid,
  result_card_value text,
  result_submitted_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_client_id text := btrim(participant_client_id);
  normalized_card_value text := btrim(selected_card_value);
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
    card_value
  )
  values (
    target_round_id,
    target_participant_id,
    normalized_card_value
  )
  on conflict (round_id, participant_id) do update
    set card_value = excluded.card_value,
        submitted_at = timezone('utc', now())
  returning
    votes.round_id,
    votes.participant_id,
    votes.card_value,
    votes.submitted_at
  into
    result_round_id,
    result_participant_id,
    result_card_value,
    result_submitted_at;

  return next;
end;
$$;

create or replace function public.kick_participant(
  target_room_id uuid,
  actor_client_id text,
  target_participant_id uuid
)
returns table (
  result_participant_id uuid,
  result_is_kicked boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := btrim(actor_client_id);
  actor_participant_id uuid;
  actor_is_kicked boolean;
  room_owner_participant_id uuid;
  target_round_id uuid;
begin
  if target_room_id is null then
    raise exception 'Room is required';
  end if;

  if normalized_actor_client_id is null or normalized_actor_client_id = '' then
    raise exception 'Actor identity is required';
  end if;

  if target_participant_id is null then
    raise exception 'Target participant is required';
  end if;

  select participants.id, participants.is_kicked
  into actor_participant_id, actor_is_kicked
  from public.participants
  where participants.room_id = target_room_id
    and participants.client_id = normalized_actor_client_id
  limit 1;

  if actor_participant_id is null or actor_is_kicked then
    raise exception 'Only active room participants can kick people';
  end if;

  select participants.id
  into room_owner_participant_id
  from public.participants
  where participants.room_id = target_room_id
  order by participants.created_at asc, participants.id asc
  limit 1;

  if target_participant_id = room_owner_participant_id then
    raise exception 'Room owner cannot be removed';
  end if;

  update public.participants
  set is_kicked = true
  where participants.room_id = target_room_id
    and participants.id = target_participant_id
    and participants.is_kicked = false
  returning participants.id, participants.is_kicked
  into result_participant_id, result_is_kicked;

  if result_participant_id is null then
    raise exception 'Target participant was not found';
  end if;

  select rounds.id
  into target_round_id
  from public.rounds
  where rounds.room_id = target_room_id
  limit 1;

  if target_round_id is not null then
    delete from public.votes
    where votes.round_id = target_round_id
      and votes.participant_id = target_participant_id;
  end if;

  return next;
end;
$$;

create or replace function public.start_reveal_countdown(
  target_room_id uuid,
  actor_client_id text
)
returns table (
  result_round_id uuid,
  result_status text,
  result_countdown_started_at timestamptz,
  result_countdown_seconds integer
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
    raise exception 'Only active room participants can reveal';
  end if;

  update public.rounds
  set status = 'countdown',
      countdown_started_at = timezone('utc', now())
  where rounds.room_id = target_room_id
    and rounds.status = 'voting'
  returning
    rounds.id,
    rounds.status,
    rounds.countdown_started_at,
    rounds.countdown_seconds
  into
    result_round_id,
    result_status,
    result_countdown_started_at,
    result_countdown_seconds;

  if result_round_id is null then
    select rounds.id, rounds.status, rounds.countdown_started_at, rounds.countdown_seconds
    into result_round_id, result_status, result_countdown_started_at, result_countdown_seconds
    from public.rounds
    where rounds.room_id = target_room_id
    limit 1;
  end if;

  return next;
end;
$$;

create or replace function public.reveal_round(
  target_room_id uuid
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
  target_countdown_started_at timestamptz;
  target_countdown_seconds integer;
begin
  if target_room_id is null then
    raise exception 'Room is required';
  end if;

  select rounds.countdown_started_at, rounds.countdown_seconds
  into target_countdown_started_at, target_countdown_seconds
  from public.rounds
  where rounds.room_id = target_room_id
  limit 1;

  update public.rounds
  set status = 'revealed',
      revealed_at = timezone('utc', now())
  where rounds.room_id = target_room_id
    and rounds.status in ('voting', 'countdown')
    and (
      rounds.status = 'voting'
      or (
        target_countdown_started_at is not null
        and timezone('utc', now()) >=
          target_countdown_started_at + make_interval(secs => target_countdown_seconds)
      )
    )
  returning rounds.id, rounds.status, rounds.revealed_at
  into result_round_id, result_status, result_revealed_at;

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
      revealed_at = null
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

create or replace function public.set_room_fun_level(
  target_room_id uuid,
  actor_client_id text,
  next_fun_level text
)
returns table (
  result_room_id uuid,
  result_fun_level text,
  result_updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_actor_client_id text := btrim(actor_client_id);
  normalized_next_fun_level text := btrim(next_fun_level);
  actor_participant_id uuid;
  actor_is_kicked boolean;
begin
  if target_room_id is null then
    raise exception 'Room is required';
  end if;

  if normalized_actor_client_id is null or normalized_actor_client_id = '' then
    raise exception 'Actor identity is required';
  end if;

  if normalized_next_fun_level not in ('disabled', 'chaotic') then
    raise exception 'Fun level is invalid';
  end if;

  select participants.id, participants.is_kicked
  into actor_participant_id, actor_is_kicked
  from public.participants
  where participants.room_id = target_room_id
    and participants.client_id = normalized_actor_client_id
  limit 1;

  if actor_participant_id is null or actor_is_kicked then
    raise exception 'Only active room participants can change fun level';
  end if;

  update public.room_settings
  set fun_level = normalized_next_fun_level
  where room_settings.room_id = target_room_id
  returning room_settings.room_id, room_settings.fun_level, room_settings.updated_at
  into result_room_id, result_fun_level, result_updated_at;

  if result_room_id is null then
    raise exception 'Room settings were not found';
  end if;

  return next;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select on public.rooms, public.room_settings, public.participants, public.rounds, public.votes to anon, authenticated;
grant execute on function public.create_or_get_room(text) to anon, authenticated;
grant execute on function public.join_room(text, text, text, text) to anon, authenticated;
grant execute on function public.set_participant_role(uuid, text, uuid, text) to anon, authenticated;
grant execute on function public.submit_vote(uuid, text, text) to anon, authenticated;
grant execute on function public.kick_participant(uuid, text, uuid) to anon, authenticated;
grant execute on function public.start_reveal_countdown(uuid, text) to anon, authenticated;
grant execute on function public.reveal_round(uuid) to anon, authenticated;
grant execute on function public.reset_round(uuid, text) to anon, authenticated;
grant execute on function public.set_room_fun_level(uuid, text, text) to anon, authenticated;
