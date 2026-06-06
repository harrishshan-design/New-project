ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'buyer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'master';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS profile_json JSONB NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_status_chk'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_status_chk CHECK (status IN ('active', 'pending', 'suspended', 'disabled'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  preferred_area TEXT,
  property_type TEXT,
  budget_min NUMERIC(14,2),
  budget_max NUMERIC(14,2),
  source TEXT NOT NULL DEFAULT 'platform',
  status TEXT NOT NULL DEFAULT 'new',
  score INT NOT NULL DEFAULT 50,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT leads_status_chk CHECK (status IN ('new', 'qualified', 'viewing', 'negotiating', 'closed', 'lost')),
  CONSTRAINT leads_score_chk CHECK (score BETWEEN 0 AND 100)
);

DROP TRIGGER IF EXISTS leads_set_updated_at ON leads;
CREATE TRIGGER leads_set_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION set_row_updated_at();

CREATE TABLE IF NOT EXISTS saved_homes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (buyer_user_id, property_id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewing_start_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'requested',
  buyer_note TEXT,
  agent_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bookings_status_chk CHECK (status IN ('requested', 'confirmed', 'rescheduled', 'completed', 'cancelled'))
);

DROP TRIGGER IF EXISTS bookings_set_updated_at ON bookings;
CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_row_updated_at();

CREATE TABLE IF NOT EXISTS negotiation_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  accepted_offer_price NUMERIC(14,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT negotiation_threads_status_chk CHECK (status IN ('active', 'offer_made', 'accepted', 'rejected', 'closed', 'cancelled'))
);

DROP TRIGGER IF EXISTS negotiation_threads_set_updated_at ON negotiation_threads;
CREATE TRIGGER negotiation_threads_set_updated_at
  BEFORE UPDATE ON negotiation_threads
  FOR EACH ROW
  EXECUTE FUNCTION set_row_updated_at();

CREATE TABLE IF NOT EXISTS negotiation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES negotiation_threads(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL,
  body TEXT NOT NULL,
  offer_price NUMERIC(14,2),
  ai_payload JSONB NOT NULL DEFAULT '{}',
  agent_approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT negotiation_messages_sender_role_chk CHECK (sender_role IN ('buyer', 'agent', 'system', 'ai'))
);

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES closed_deals(id) ON DELETE SET NULL,
  cobroke_match_id UUID REFERENCES cobroke_matches(id) ON DELETE SET NULL,
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL DEFAULT 'agent_commission',
  gross_amount NUMERIC(14,2) NOT NULL,
  platform_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  agent_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT commissions_source_type_chk CHECK (source_type IN ('agent_commission', 'bank_referral', 'saas_subscription', 'escrow_fee')),
  CONSTRAINT commissions_status_chk CHECK (status IN ('pending', 'earned', 'paid', 'cancelled'))
);

DROP TRIGGER IF EXISTS commissions_set_updated_at ON commissions;
CREATE TRIGGER commissions_set_updated_at
  BEFORE UPDATE ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION set_row_updated_at();

CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  feature TEXT NOT NULL,
  provider TEXT NOT NULL,
  input_json JSONB NOT NULL DEFAULT '{}',
  output_json JSONB NOT NULL DEFAULT '{}',
  latency_ms INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_role_status_idx ON users (role, status);
CREATE INDEX IF NOT EXISTS leads_agent_status_idx ON leads (agent_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS saved_homes_buyer_idx ON saved_homes (buyer_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_buyer_idx ON bookings (buyer_user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS bookings_agent_idx ON bookings (agent_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS negotiation_threads_buyer_idx ON negotiation_threads (buyer_user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS negotiation_threads_agent_idx ON negotiation_threads (agent_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS negotiation_messages_thread_idx ON negotiation_messages (thread_id, created_at);
CREATE INDEX IF NOT EXISTS commissions_agent_status_idx ON commissions (agent_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS ai_generations_feature_idx ON ai_generations (feature, created_at DESC);
