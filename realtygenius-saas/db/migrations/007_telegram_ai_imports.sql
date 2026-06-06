create extension if not exists pgcrypto;

create table if not exists public.telegram_raw_messages (
  id uuid primary key default gen_random_uuid(),
  telegram_update_id bigint not null unique,
  update_type text not null default 'message',
  chat_id text,
  chat_title text,
  message_id bigint,
  message_date timestamptz,
  sender_id text,
  sender_username text,
  text text,
  caption text,
  telegram_file_ids text[] not null default '{}',
  raw_payload jsonb not null default '{}'::jsonb,
  processed_status text not null default 'received',
  ai_summary text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_imported_listings (
  id uuid primary key default gen_random_uuid(),
  raw_message_id uuid references public.telegram_raw_messages(id) on delete set null,
  source text not null default 'telegram',
  source_chat_id text,
  source_chat_title text,
  source_message_id bigint,
  dedup_hash text not null unique,
  original_text text,
  extraction_json jsonb not null default '{}'::jsonb,
  title text not null,
  location text,
  price numeric,
  price_text text,
  bedrooms integer,
  bathrooms integer,
  built_up_sqft numeric,
  property_type text,
  description text,
  highlights text[] not null default '{}',
  facilities text[] not null default '{}',
  nearby_landmarks text[] not null default '{}',
  image_urls text[] not null default '{}',
  contact_phone text,
  map_query text,
  confidence_score integer not null default 0 check (confidence_score between 0 and 100),
  missing_fields text[] not null default '{}',
  admin_notes text,
  status text not null default 'needs_review'
    check (status in ('needs_review', 'approved', 'rejected', 'live')),
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  category text not null default 'system',
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_telegram_raw_messages_chat_message
  on public.telegram_raw_messages(chat_id, message_id);

create index if not exists idx_ai_imported_listings_status_created
  on public.ai_imported_listings(status, created_at desc);

create index if not exists idx_ai_imported_listings_source_message
  on public.ai_imported_listings(source_chat_id, source_message_id);

create index if not exists idx_admin_notifications_category_created
  on public.admin_notifications(category, created_at desc);

alter table public.telegram_raw_messages enable row level security;
alter table public.ai_imported_listings enable row level security;
alter table public.admin_notifications enable row level security;

drop policy if exists "service_role_manage_telegram_raw_messages" on public.telegram_raw_messages;
create policy "service_role_manage_telegram_raw_messages"
  on public.telegram_raw_messages
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "service_role_manage_ai_imported_listings" on public.ai_imported_listings;
create policy "service_role_manage_ai_imported_listings"
  on public.ai_imported_listings
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "service_role_manage_admin_notifications" on public.admin_notifications;
create policy "service_role_manage_admin_notifications"
  on public.admin_notifications
  for all
  to service_role
  using (true)
  with check (true);

grant usage on schema public to service_role;
grant select, insert, update, delete on public.telegram_raw_messages to service_role;
grant select, insert, update, delete on public.ai_imported_listings to service_role;
grant select, insert, update, delete on public.admin_notifications to service_role;
