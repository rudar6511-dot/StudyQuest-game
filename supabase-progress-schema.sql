-- StudyQuest Phase 1: cloud progress table
create table if not exists public.sq_student_progress (
  player_id text primary key,
  player_name text not null default 'Student',
  xp integer not null default 0,
  coins integer not null default 0,
  progress jsonb not null default '{"math":1,"science":1,"english":1,"hindi":1,"ss":1}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.sq_student_progress enable row level security;

drop policy if exists "progress read" on public.sq_student_progress;
drop policy if exists "progress insert" on public.sq_student_progress;
drop policy if exists "progress update" on public.sq_student_progress;

-- Prototype policies: suitable for testing with the publishable client key.
-- For production, replace these with Supabase Auth-based policies so each student
-- can only read/write their own row.
create policy "progress read" on public.sq_student_progress for select using (true);
create policy "progress insert" on public.sq_student_progress for insert with check (true);
create policy "progress update" on public.sq_student_progress for update using (true) with check (true);
