ALTER TABLE buyers
  ADD COLUMN IF NOT EXISTS property_type TEXT;

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS property_type TEXT NOT NULL DEFAULT 'Condo';

ALTER TABLE cobroke_matches
  ADD COLUMN IF NOT EXISTS listing_agent_signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS buyer_agent_signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS agreement_reference TEXT,
  ADD COLUMN IF NOT EXISTS notification_payload JSONB NOT NULL DEFAULT '{}';

CREATE UNIQUE INDEX IF NOT EXISTS cobroke_unique_match_idx
  ON cobroke_matches (listing_agent_id, buyer_agent_id, property_id, buyer_id);

CREATE INDEX IF NOT EXISTS buyers_property_type_idx
  ON buyers (property_type);

CREATE INDEX IF NOT EXISTS properties_type_area_price_idx
  ON properties (property_type, area, asking_price);
