create extension if not exists pgcrypto;

create table if not exists public.agent_property_listings (
  id uuid primary key default gen_random_uuid(),
  agent_id text,
  title text not null,
  area text,
  price numeric,
  property_type text,
  address text,
  landlord_name text,
  landlord_phone text,
  gallery_urls jsonb not null default '[]'::jsonb,
  ar_link text,
  status text not null default 'pending_qc'
    check (status in ('pending_qc', 'approved', 'rejected', 'live')),
  rejection_reason text,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_agent_property_listings_status_created
  on public.agent_property_listings(status, created_at desc);

create index if not exists idx_agent_property_listings_agent_created
  on public.agent_property_listings(agent_id, created_at desc);

alter table public.agent_property_listings enable row level security;

drop policy if exists "service_role_manage_agent_property_listings" on public.agent_property_listings;
create policy "service_role_manage_agent_property_listings"
  on public.agent_property_listings
  for all
  to service_role
  using (true)
  with check (true);

grant usage on schema public to service_role;
grant select, insert, update, delete on public.agent_property_listings to service_role;
