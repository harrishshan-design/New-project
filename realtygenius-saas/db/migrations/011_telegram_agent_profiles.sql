create table if not exists public.telegram_agent_profiles (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id text not null unique,
  chat_id text not null,
  chat_title text,
  username text,
  full_name text,
  email text,
  phone text,
  ren_id text,
  onboarding_step text not null default 'full_name'
    check (onboarding_step in ('full_name', 'email', 'phone', 'ren_id', 'complete')),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_telegram_agent_profiles_chat
  on public.telegram_agent_profiles(chat_id, updated_at desc);

alter table public.telegram_agent_profiles enable row level security;

drop policy if exists "service_role_manage_telegram_agent_profiles" on public.telegram_agent_profiles;
create policy "service_role_manage_telegram_agent_profiles"
  on public.telegram_agent_profiles
  for all
  to service_role
  using (true)
  with check (true);

grant select, insert, update, delete on public.telegram_agent_profiles to service_role;
