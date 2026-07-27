alter table public.ai_imported_listings
  add column if not exists source_sender_id text,
  add column if not exists telegram_profile_id uuid references public.telegram_agent_profiles(id) on delete set null,
  add column if not exists approved_agent_user_id uuid references public.users(id) on delete set null,
  add column if not exists agent_profile_json jsonb not null default '{}'::jsonb;

create index if not exists idx_ai_imported_listings_telegram_profile
  on public.ai_imported_listings(telegram_profile_id);

create index if not exists idx_ai_imported_listings_approved_agent
  on public.ai_imported_listings(approved_agent_user_id);
