-- StudyQuest cloud profile table
-- Run this once in Supabase SQL Editor.
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

-- Allow the online leaderboard to read only the non-sensitive game identity fields.
-- If you later want stricter privacy, replace the leaderboard's direct table read
-- with a security-definer RPC/view containing only username/student_name + game stats.
