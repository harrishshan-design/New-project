-- Leads captured from the site (property inquiries, bookings, offers).
-- Replaces the flat-file kvai_database.json "leads" array so writes are
-- durable and safe across multiple server instances.
create table if not exists public.leads (
    id bigserial primary key,
    created_at timestamptz not null default now(),
    property_id text,
    buyer_name text,
    buyer_phone text,
    source text,
    inquiry_type text,
    payload jsonb not null default '{}'::jsonb
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_buyer_phone_idx on public.leads (buyer_phone);

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
