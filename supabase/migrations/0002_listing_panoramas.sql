-- 360-degree panorama photos on agent listings, powering the buyer
-- Immersive View room tours. Same jsonb shape as gallery_urls:
-- [{ "label": "...", "url": "https://...", "source": "..." }, ...]
alter table public.agent_property_listings
    add column if not exists pano_urls jsonb not null default '[]'::jsonb;
