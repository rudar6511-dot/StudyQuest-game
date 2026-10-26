-- StudyQuest Guilds: run in Supabase Dashboard > SQL Editor.
-- This schema is a starting point for real multi-user guilds. Configure Supabase Auth
-- and test the policies before using with real students.
create extension if not exists pgcrypto;
create table if not exists public.sq_guilds (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(name) between 3 and 40),
 description text not null default '' check (char_length(description) <= 160),
 admin_email text not null,
 admin_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create unique index if not exists sq_guilds_name_lower_unique on public.sq_guilds (lower(name));
create table if not exists public.sq_guild_questions (
 id uuid primary key default gen_random_uuid(),
 guild_id uuid not null references public.sq_guilds(id) on delete cascade,
 question_no int not null check (question_no between 1 and 20),
 subject text not null check (subject in ('Maths','Science','English','Reasoning')),
 question text not null,
 options jsonb not null check (jsonb_typeof(options)='array' and jsonb_array_length(options)=4),
 correct_option smallint not null check (correct_option between 0 and 3),
 unique(guild_id,question_no)
);
create table if not exists public.sq_guild_applications (
 id uuid primary key default gen_random_uuid(),
 guild_id uuid not null references public.sq_guilds(id) on delete cascade,
 applicant_id uuid not null references auth.users(id) on delete cascade,
 applicant_email text not null,
 answers jsonb not null,
 score int check (score between 0 and 20),
 status text not null default 'pending' check (status in ('pending','accepted','rejected')),
 submitted_at timestamptz not null default now(),
 reviewed_at timestamptz,
 unique(guild_id,applicant_id)
);
create table if not exists public.sq_guild_members (
 guild_id uuid not null references public.sq_guilds(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 joined_at timestamptz not null default now(),
 primary key(guild_id,user_id)
);
alter table public.sq_guilds enable row level security;
alter table public.sq_guild_questions enable row level security;
alter table public.sq_guild_applications enable row level security;
alter table public.sq_guild_members enable row level security;
drop policy if exists "Guilds visible to everyone" on public.sq_guilds;
create policy "Guilds visible to everyone" on public.sq_guilds for select using (true);
drop policy if exists "Signed-in users create guilds" on public.sq_guilds;
create policy "Signed-in users create guilds" on public.sq_guilds for insert to authenticated with check (admin_id=auth.uid());
drop policy if exists "Admins update own guilds" on public.sq_guilds;
create policy "Admins update own guilds" on public.sq_guilds for update to authenticated using (admin_id=auth.uid()) with check (admin_id=auth.uid());
drop policy if exists "Guild test questions visible to signed-in users" on public.sq_guild_questions;
create policy "Guild test questions visible to signed-in users" on public.sq_guild_questions for select to authenticated using (true);
drop policy if exists "Guild admins manage test questions" on public.sq_guild_questions;
create policy "Guild admins manage test questions" on public.sq_guild_questions for all to authenticated using (exists(select 1 from public.sq_guilds g where g.id=guild_id and g.admin_id=auth.uid())) with check (exists(select 1 from public.sq_guilds g where g.id=guild_id and g.admin_id=auth.uid()));
drop policy if exists "Applicants see own applications" on public.sq_guild_applications;
create policy "Applicants see own applications" on public.sq_guild_applications for select to authenticated using (applicant_id=auth.uid() or exists(select 1 from public.sq_guilds g where g.id=guild_id and g.admin_id=auth.uid()));
drop policy if exists "Applicants submit own applications" on public.sq_guild_applications;
create policy "Applicants submit own applications" on public.sq_guild_applications for insert to authenticated with check (applicant_id=auth.uid() and status='pending' and score is null);
drop policy if exists "Admins review applications" on public.sq_guild_applications;
create policy "Admins review applications" on public.sq_guild_applications for update to authenticated using (exists(select 1 from public.sq_guilds g where g.id=guild_id and g.admin_id=auth.uid())) with check (exists(select 1 from public.sq_guilds g where g.id=guild_id and g.admin_id=auth.uid()));
drop policy if exists "Guild members visible" on public.sq_guild_members;
create policy "Guild members visible" on public.sq_guild_members for select using (true);
drop policy if exists "Users join only accepted guilds" on public.sq_guild_members;
create policy "Users join only accepted guilds" on public.sq_guild_members for insert to authenticated with check (user_id=auth.uid() and exists(select 1 from public.sq_guild_applications a where a.guild_id=sq_guild_members.guild_id and a.applicant_id=auth.uid() and a.status='accepted'));
-- NOTE: Production grading must happen server-side (RPC/Edge Function). Do not trust client-supplied scores.

-- Add these columns safely if the tables were created from an earlier version.
alter table public.sq_guilds add column if not exists admin_email text;
alter table public.sq_guild_applications add column if not exists applicant_email text;
