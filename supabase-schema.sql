-- StudyQuest Live Multiplayer schema
create table if not exists public.sq_rooms (
 id uuid primary key default gen_random_uuid(),
 code text unique not null,
 name text not null default 'StudyQuest Live Room',
 host_id text not null,
 status text not null default 'lobby',
 started_at timestamptz,
 created_at timestamptz not null default now()
);
create table if not exists public.sq_room_players (
 room_id uuid references public.sq_rooms(id) on delete cascade,
 player_id text not null,
 player_name text not null,
 ready boolean not null default false,
 score integer not null default 0,
 joined_at timestamptz not null default now(),
 primary key(room_id,player_id)
);
alter table public.sq_rooms enable row level security;
alter table public.sq_room_players enable row level security;
create policy "rooms read" on public.sq_rooms for select using (true);
create policy "rooms create" on public.sq_rooms for insert with check (true);
create policy "rooms update" on public.sq_rooms for update using (true) with check (true);
create policy "players read" on public.sq_room_players for select using (true);
create policy "players join" on public.sq_room_players for insert with check (true);
create policy "players update" on public.sq_room_players for update using (true) with check (true);
create policy "players leave" on public.sq_room_players for delete using (true);
alter publication supabase_realtime add table public.sq_rooms;
alter publication supabase_realtime add table public.sq_room_players;
