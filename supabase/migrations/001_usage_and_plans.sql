-- Usage & Plan Tracking for FirstVisit AI
-- Run this in your Supabase SQL editor

-- Plans table: defines plan tiers and their limits
create table if not exists plans (
  id text primary key,
  name text not null,
  analyses_per_month integer not null,
  price_cents integer not null default 0,
  created_at timestamptz not null default now()
);

-- Seed the three pricing tiers
insert into plans (id, name, analyses_per_month, price_cents) values
  ('free', 'Free', 3, 0),
  ('starter', 'Starter', 30, 2900),
  ('pro', 'Pro', -1, 9900)  -- -1 = unlimited
on conflict (id) do nothing;

-- User plans: tracks which plan a user is on
create table if not exists user_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id text not null references plans(id) default 'free',
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Usage logs: one row per analysis run
create table if not exists usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null default 'analysis',
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- Index for fast monthly usage count queries
create index if not exists idx_usage_logs_user_month
  on usage_logs (user_id, created_at desc);

-- Auto-assign free plan on user signup (trigger)
create or replace function public.handle_new_user_plan()
returns trigger as $$
begin
  insert into public.user_plans (user_id, plan_id)
  values (new.id, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop the trigger if it exists, then recreate
drop trigger if exists on_auth_user_created_plan on auth.users;
create trigger on_auth_user_created_plan
  after insert on auth.users
  for each row execute function public.handle_new_user_plan();

-- RLS policies
alter table plans enable row level security;
alter table user_plans enable row level security;
alter table usage_logs enable row level security;

-- Plans are readable by everyone (public metadata)
create policy "Plans are publicly readable"
  on plans for select using (true);

-- Users can read their own plan
create policy "Users can read own plan"
  on user_plans for select using (auth.uid() = user_id);

-- Users can read their own usage logs
create policy "Users can read own usage"
  on usage_logs for select using (auth.uid() = user_id);

-- Service role can insert usage logs (API routes use admin client)
-- No insert policy needed for anon — only the service role key is used for writes
