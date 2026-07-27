create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text unique not null,
  phone text,
  password_hash text,
  role text not null default 'buyer'
    check (role in ('buyer', 'agent', 'admin', 'master')),
  status text not null default 'active',
  agency_name text,
  ren_id text,
  profile_json jsonb not null default '{}'::jsonb,
  plan text default 'free',
  subscription_plan text default 'free',
  subscription_status text default 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  auction_slots_monthly integer not null default 0,
  features_unlocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists password_hash text,
  add column if not exists role text default 'buyer',
  add column if not exists status text default 'active',
  add column if not exists agency_name text,
  add column if not exists ren_id text,
  add column if not exists profile_json jsonb not null default '{}'::jsonb,
  add column if not exists plan text default 'free',
  add column if not exists subscription_plan text default 'free',
  add column if not exists subscription_status text default 'inactive',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists auction_slots_monthly integer not null default 0,
  add column if not exists features_unlocked boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists profiles_email_unique_idx
  on public.profiles(lower(email));

create index if not exists profiles_phone_agent_lookup_idx
  on public.profiles(phone)
  where role = 'agent';

create index if not exists profiles_role_status_idx
  on public.profiles(role, status);

alter table public.telegram_agent_profiles
  drop constraint if exists telegram_agent_profiles_user_id_fkey,
  add column if not exists user_id uuid references public.profiles(id) on delete set null,
  add column if not exists agency_name text;

create index if not exists idx_telegram_agent_profiles_profile
  on public.telegram_agent_profiles(user_id);
