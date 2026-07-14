-- Lets agents mark a listing for sale or for rent so buyers see which it is.
alter table public.agent_property_listings
    add column if not exists listing_purpose text not null default 'sale';

alter table public.agent_property_listings
    drop constraint if exists agent_property_listings_listing_purpose_check;

alter table public.agent_property_listings
    add constraint agent_property_listings_listing_purpose_check
    check (listing_purpose in ('sale', 'rent'));
