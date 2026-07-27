alter table public.telegram_agent_profiles
  add column if not exists user_id uuid references public.users(id) on delete set null,
  add column if not exists agency_name text;

create index if not exists idx_telegram_agent_profiles_user
  on public.telegram_agent_profiles(user_id);

create index if not exists idx_telegram_agent_profiles_phone
  on public.telegram_agent_profiles(phone);

create index if not exists idx_users_phone_agent_lookup
  on public.users(phone)
  where role = 'agent';
