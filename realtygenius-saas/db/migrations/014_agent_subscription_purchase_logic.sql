alter table public.users
  add column if not exists subscription_plan text not null default 'free',
  add column if not exists subscription_status text not null default 'inactive',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists auction_slots_monthly integer not null default 0,
  add column if not exists features_unlocked boolean not null default false;

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  full_name text,
  email text unique not null,
  subscription_plan text not null default 'free',
  subscription_status text not null default 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_feature_usage (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.users(id) on delete cascade,
  feature_name text not null,
  usage_count integer not null default 0,
  month text not null,
  created_at timestamptz not null default now(),
  unique(agent_id, feature_name, month)
);

create table if not exists public.auction_slots (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.users(id) on delete cascade,
  month text not null,
  plan_slots integer not null default 0,
  extra_slots integer not null default 0,
  used_slots integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(agent_id, month)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.users(id) on delete set null,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_payment_intent_id text,
  plan text,
  amount integer,
  status text,
  created_at timestamptz not null default now()
);

create index if not exists users_subscription_plan_status_idx
  on public.users(subscription_plan, subscription_status);

create index if not exists auction_slots_agent_month_idx
  on public.auction_slots(agent_id, month);
