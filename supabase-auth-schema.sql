-- StudyQuest cloud profile + Quest ID lookup
-- Run this entire file once in Supabase SQL Editor.
create table if not exists public.sq_student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  quest_id text unique not null,
  student_name text not null default 'Student',
  school_name text not null default '',
  school_board text not null default '',
  state text not null default '',
  village text not null default '',
  district text not null default '',
  address text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sq_student_profiles enable row level security;

drop policy if exists "profiles own read" on public.sq_student_profiles;
drop policy if exists "profiles own insert" on public.sq_student_profiles;
drop policy if exists "profiles own update" on public.sq_student_profiles;

create policy "profiles own read" on public.sq_student_profiles
  for select using (auth.uid() = user_id);
create policy "profiles own insert" on public.sq_student_profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles own update" on public.sq_student_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.sq_create_student_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.sq_student_profiles (
    user_id, username, quest_id, student_name, school_name, school_board,
    state, village, district, address
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username',''),
    coalesce(new.raw_user_meta_data->>'quest_id',''),
    coalesce(new.raw_user_meta_data->>'student_name','Student'),
    coalesce(new.raw_user_meta_data->>'school_name',''),
    coalesce(new.raw_user_meta_data->>'school_board',''),
    coalesce(new.raw_user_meta_data->>'state',''),
    coalesce(new.raw_user_meta_data->>'village',''),
    coalesce(new.raw_user_meta_data->>'district',''),
    coalesce(new.raw_user_meta_data->>'address','')
  )
  on conflict (user_id) do update set
    username=excluded.username,
    quest_id=excluded.quest_id,
    student_name=excluded.student_name,
    school_name=excluded.school_name,
    school_board=excluded.school_board,
    state=excluded.state,
    village=excluded.village,
    district=excluded.district,
    address=excluded.address,
    updated_at=now();
  return new;
end;
$$;

drop trigger if exists sq_create_student_profile on auth.users;
create trigger sq_create_student_profile
after insert on auth.users
for each row execute function public.sq_create_student_profile();

create or replace function public.sq_get_username_by_quest_id(p_quest_id text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select username
  from public.sq_student_profiles
  where lower(quest_id) = lower(trim(p_quest_id))
  limit 1;
$$;

revoke all on function public.sq_get_username_by_quest_id(text) from public;
grant execute on function public.sq_get_username_by_quest_id(text) to anon, authenticated;

-- Global StudyQuest online/offline roster.
-- Stores only the game ID, display name and heartbeat time.
create table if not exists public.sq_presence (
  player_id text primary key,
  player_username text,
  player_name text not null default 'Student',
  last_seen timestamptz not null default now()
);
alter table public.sq_presence add column if not exists player_username text;

alter table public.sq_presence enable row level security;

drop policy if exists "presence read" on public.sq_presence;
drop policy if exists "presence insert" on public.sq_presence;
drop policy if exists "presence update" on public.sq_presence;

create policy "presence read" on public.sq_presence
  for select using (true);
create policy "presence insert" on public.sq_presence
  for insert with check (true);
create policy "presence update" on public.sq_presence
  for update using (true) with check (true);

grant select, insert, update on public.sq_presence to anon, authenticated;

do $$
begin
  alter publication supabase_realtime add table public.sq_presence;
exception
  when duplicate_object then null;
end $$;


-- Resolve usernames for older presence rows so friend requests also work
-- for players who were offline before player_username was added.
create or replace function public.sq_get_public_usernames(p_user_ids text[])
returns table(user_id text, username text)
language sql
security definer
set search_path = public
stable
as $$
  select sp.user_id::text, sp.username
  from public.sq_student_profiles sp
  where sp.user_id::text = any(p_user_ids)
    and sp.username is not null
    and sp.username <> '';
$$;

revoke all on function public.sq_get_public_usernames(text[]) from public;
grant execute on function public.sq_get_public_usernames(text[]) to anon, authenticated;
