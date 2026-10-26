-- StudyQuest Guild Gmail approval system (production-oriented starter)
create extension if not exists pgcrypto;

create table if not exists public.sq_guilds (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(name) between 3 and 40),
 description text not null default '' check (char_length(description) <= 160),
 admin_id uuid not null references auth.users(id) on delete cascade,
 admin_email text not null,
 created_at timestamptz not null default now()
);
create unique index if not exists sq_guilds_name_lower_unique on public.sq_guilds(lower(name));

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
 applicant_name text not null check (char_length(applicant_name) between 1 and 60),
 applicant_email text not null,
 answers jsonb not null check (jsonb_typeof(answers)='array' and jsonb_array_length(answers)=20),
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
create table if not exists public.sq_guild_review_tokens (
 id uuid primary key default gen_random_uuid(),
 application_id uuid not null references public.sq_guild_applications(id) on delete cascade,
 token_hash text not null unique,
 decision text not null check (decision in ('accepted','rejected')),
 expires_at timestamptz not null,
 used_at timestamptz,
 created_at timestamptz not null default now()
);

alter table public.sq_guilds enable row level security;
alter table public.sq_guild_questions enable row level security;
alter table public.sq_guild_applications enable row level security;
alter table public.sq_guild_members enable row level security;
alter table public.sq_guild_review_tokens enable row level security;
-- All sensitive reads/writes are done by the Edge Function using service role.
-- Browser clients get no direct table policies. Never expose service role key.
revoke all on public.sq_guilds, public.sq_guild_questions, public.sq_guild_applications,
 public.sq_guild_members, public.sq_guild_review_tokens from anon, authenticated;
grant usage on schema public to authenticated;
