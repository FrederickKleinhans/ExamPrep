-- CertArc — Supabase schema
-- Run this once in your Supabase project via the SQL editor.

-- ── Progress table ─────────────────────────────────────────────────────────
-- Stores the full UserProgress JSON blob for each authenticated user.
-- One row per user, updated on every sync.

create table if not exists public.user_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  progress    jsonb not null,
  updated_at  timestamptz not null default now()
);

-- Index for fast user lookups
create index if not exists user_progress_user_id_idx on public.user_progress(user_id);

-- Auto-update updated_at on every row change
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_progress_updated_at on public.user_progress;
create trigger user_progress_updated_at
  before update on public.user_progress
  for each row execute procedure public.update_updated_at();

-- ── Row Level Security ─────────────────────────────────────────────────────
-- Users can only read and write their own row.

alter table public.user_progress enable row level security;

create policy "Users can read their own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

create policy "Users can delete their own progress"
  on public.user_progress for delete
  using (auth.uid() = user_id);

-- ── Question feedback ──────────────────────────────────────────────────────
-- Question reports are insert-only from the app; review them in the dashboard.

create table if not exists public.question_feedback (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete set null,
  certification_id  text not null check (char_length(certification_id) between 1 and 100),
  question_id       text not null check (char_length(question_id) between 1 and 200),
  category          text not null check (category in ('incorrect', 'unclear', 'outdated', 'other')),
  details           text check (details is null or char_length(details) <= 2000),
  created_at        timestamptz not null default now()
);

create index if not exists question_feedback_created_at_idx
  on public.question_feedback(created_at desc);

alter table public.question_feedback enable row level security;

create policy "Users can submit question feedback"
  on public.question_feedback for insert
  with check (
    (auth.uid() is null and user_id is null)
    or auth.uid() = user_id
  );

grant insert on public.question_feedback to anon, authenticated;
