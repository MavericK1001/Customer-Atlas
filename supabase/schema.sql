create extension if not exists "pgcrypto";

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  url text not null,
  website_overview text not null,
  first_impression text not null,
  what_visitor_thinks text not null,
  trust_level_summary text not null,
  trust_score integer not null check (trust_score between 0 and 100),
  clarity_score integer not null check (clarity_score between 0 and 100),
  conversion_score integer not null check (conversion_score between 0 and 100),
  likelihood_of_leaving integer not null check (likelihood_of_leaving between 0 and 100),
  confusion_points text[] not null default '{}',
  improvement_suggestions text[] not null default '{}',
  persona_feedback jsonb not null default '[]'::jsonb,
  journey_simulation jsonb not null default '[]'::jsonb,
  raw_crawl jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists analyses_user_id_created_at_idx on public.analyses (user_id, created_at desc);

alter table public.analyses enable row level security;

create policy "Users can read their analyses"
on public.analyses
for select
using (auth.uid() = user_id or user_id is null);

create policy "Users can insert their analyses"
on public.analyses
for insert
with check (auth.uid() = user_id or user_id is null);