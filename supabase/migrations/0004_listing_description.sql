-- Optional agent-written property description shown to buyers.
-- When blank, the backend generates a tidy fallback summary instead.
alter table public.agent_property_listings
    add column if not exists description text not null default '';
