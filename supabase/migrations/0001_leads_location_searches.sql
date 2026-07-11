-- Website inquiry leads (property inquiries, bookings, offers) captured by
-- the public site. Named website_leads because public.leads already belongs
-- to the RealtyGenius SaaS CRM in this shared Supabase project.
-- Replaces the flat-file kvai_database.json "leads" array so writes are
-- durable and safe across multiple server instances.
create table if not exists public.website_leads (
    id bigserial primary key,
    created_at timestamptz not null default now(),
    property_id text,
    buyer_name text,
    buyer_phone text,
    source text,
    inquiry_type text,
    payload jsonb not null default '{}'::jsonb
);

create index if not exists website_leads_created_at_idx on public.website_leads (created_at desc);
create index if not exists website_leads_buyer_phone_idx on public.website_leads (buyer_phone);

-- Redacted location-search demand signals (analytics only).
-- Replaces the flat-file kvai_database.json "locationSearches" array.
create table if not exists public.location_searches (
    id bigserial primary key,
    created_at timestamptz not null default now(),
    query_hash text,
    redacted_query text,
    query_type text,
    filter text,
    google_status text,
    suggestion_count integer,
    source text
);

create index if not exists location_searches_created_at_idx on public.location_searches (created_at desc);

alter table public.website_leads enable row level security;
alter table public.location_searches enable row level security;
drop policy if exists "service role full access website_leads" on public.website_leads;
create policy "service role full access website_leads" on public.website_leads for all to service_role using (true) with check (true);
drop policy if exists "service role full access location_searches" on public.location_searches;
create policy "service role full access location_searches" on public.location_searches for all to service_role using (true) with check (true);
