create table if not exists public.telegram_listing_sessions (
  id uuid primary key default gen_random_uuid(),
  chat_id text not null,
  chat_title text,
  started_by text,
  status text not null default 'collecting_photos'
    check (status in ('collecting_photos', 'awaiting_details', 'submitted', 'cancelled')),
  telegram_file_ids text[] not null default '{}',
  image_urls text[] not null default '{}',
  details_text text,
  import_id uuid references public.ai_imported_listings(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);

create index if not exists idx_telegram_listing_sessions_chat_status
  on public.telegram_listing_sessions(chat_id, status, updated_at desc);

alter table public.telegram_listing_sessions enable row level security;

drop policy if exists "service_role_manage_telegram_listing_sessions" on public.telegram_listing_sessions;
create policy "service_role_manage_telegram_listing_sessions"
  on public.telegram_listing_sessions
  for all
  to service_role
  using (true)
  with check (true);

grant select, insert, update, delete on public.telegram_listing_sessions to service_role;
