CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE user_role AS ENUM ('agent', 'admin');
CREATE TYPE document_type AS ENUM ('ic', 'payslip', 'epf', 'bank_statement', 'other');
CREATE TYPE loan_readiness AS ENUM ('likely', 'risky', 'not_qualified');
CREATE TYPE viewing_status AS ENUM ('draft', 'requested', 'confirmed', 'completed', 'cancelled');
CREATE TYPE cobroke_status AS ENUM ('suggested', 'invited', 'accepted', 'declined', 'signed');
CREATE TYPE referral_status AS ENUM ('scheduled', 'drafted', 'sent', 'snoozed');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'agent',
  agency_name TEXT,
  ren_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE buyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_area TEXT,
  budget_min NUMERIC(14,2),
  budget_max NUMERIC(14,2),
  monthly_income NUMERIC(14,2),
  monthly_debt NUMERIC(14,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE document_vaults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  magic_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE buyer_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vault_id UUID NOT NULL REFERENCES document_vaults(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  s3_key TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  ocr_text TEXT,
  extracted_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dsr_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gross_monthly_income NUMERIC(14,2) NOT NULL,
  existing_monthly_debt NUMERIC(14,2) NOT NULL,
  proposed_installment NUMERIC(14,2) NOT NULL,
  dsr_percent NUMERIC(6,2) NOT NULL,
  readiness loan_readiness NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  area TEXT NOT NULL,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  asking_price NUMERIC(14,2) NOT NULL,
  bedrooms INT,
  bathrooms INT,
  built_up_sqft INT,
  maintenance_fee NUMERIC(10,2),
  developer TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE property_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  transacted_price NUMERIC(14,2) NOT NULL,
  transacted_at DATE NOT NULL,
  unit_size_sqft INT,
  source TEXT NOT NULL DEFAULT 'manual'
);

CREATE TABLE viewing_itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  viewing_date DATE NOT NULL,
  share_token TEXT UNIQUE NOT NULL,
  route_summary JSONB NOT NULL DEFAULT '{}',
  status viewing_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE itinerary_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  itinerary_id UUID NOT NULL REFERENCES viewing_itineraries(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  stop_order INT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  travel_minutes INT NOT NULL DEFAULT 0,
  landlord_name TEXT,
  landlord_phone TEXT,
  confirmation_status viewing_status NOT NULL DEFAULT 'requested'
);

CREATE TABLE cobroke_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  match_score NUMERIC(5,2) NOT NULL,
  rationale TEXT NOT NULL,
  commission_split NUMERIC(5,2) NOT NULL DEFAULT 50.00,
  status cobroke_status NOT NULL DEFAULT 'suggested',
  agreement_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE viewing_cheat_sheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES buyers(id) ON DELETE SET NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE closed_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  closed_at DATE NOT NULL,
  closed_price NUMERIC(14,2) NOT NULL,
  commission_amount NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE referral_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES closed_deals(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  anniversary_year INT NOT NULL,
  due_at DATE NOT NULL,
  estimated_value NUMERIC(14,2),
  valuation_report JSONB NOT NULL DEFAULT '{}',
  whatsapp_draft TEXT,
  email_subject TEXT,
  email_body TEXT,
  status referral_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(deal_id, anniversary_year)
);

CREATE INDEX buyers_agent_area_idx ON buyers(agent_id, preferred_area);
CREATE INDEX properties_area_idx ON properties USING gin (area gin_trgm_ops);
CREATE INDEX cobroke_status_idx ON cobroke_matches(status);
CREATE INDEX referral_due_idx ON referral_campaigns(due_at, status);
