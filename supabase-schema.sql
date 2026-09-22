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


-- Global StudyQuest player presence for the online players sidebar.
create table if not exists public.sq_presence (
  player_id text primary key,
  player_name text not null default 'Student',
  last_seen timestamptz not null default now()
);
alter table public.sq_presence enable row level security;
drop policy if exists "presence read" on public.sq_presence;
drop policy if exists "presence insert" on public.sq_presence;
drop policy if exists "presence update" on public.sq_presence;
create policy "presence read" on public.sq_presence for select using (true);
create policy "presence insert" on public.sq_presence for insert with check (true);
create policy "presence update" on public.sq_presence for update using (true) with check (true);
grant select, insert, update on public.sq_presence to anon, authenticated;
do $$
begin
  alter publication supabase_realtime add table public.sq_presence;
exception
  when duplicate_object then null;
end $$;

-- StudyQuest student search + friend requests
create table if not exists public.sq_friend_requests (
  id uuid primary key default gen_random_uuid(), sender_username text not null, sender_name text not null default 'Student', receiver_username text not null,
  status text not null default 'pending' check (status in ('pending','accepted','declined')), created_at timestamptz not null default now(), unique(sender_username, receiver_username)
);
alter table public.sq_friend_requests enable row level security;
drop policy if exists "friend requests read" on public.sq_friend_requests;
drop policy if exists "friend requests insert" on public.sq_friend_requests;
drop policy if exists "friend requests update" on public.sq_friend_requests;
create policy "friend requests read" on public.sq_friend_requests for select using (true);
create policy "friend requests insert" on public.sq_friend_requests for insert with check (true);
create policy "friend requests update" on public.sq_friend_requests for update using (true) with check (true);
grant select, insert, update on public.sq_friend_requests to anon, authenticated;
create or replace function public.sq_find_students(p_query text)
returns table(username text, quest_id text, student_name text)
language sql security definer set search_path = public stable as $$
  select p.username,p.quest_id,p.student_name from public.sq_student_profiles p
  where length(trim(coalesce(p_query,''))) >= 2 and (lower(p.username) like '%'||lower(trim(p_query))||'%' or lower(p.quest_id) like '%'||lower(trim(p_query))||'%' or lower(p.student_name) like '%'||lower(trim(p_query))||'%')
  order by p.username limit 20;
$$;
revoke all on function public.sq_find_students(text) from public;
grant execute on function public.sq_find_students(text) to anon, authenticated;
do $$ begin alter publication supabase_realtime add table public.sq_friend_requests; exception when duplicate_object then null; end $$;
