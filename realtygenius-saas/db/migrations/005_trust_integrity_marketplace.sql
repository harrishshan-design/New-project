ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS confidence_score INT NOT NULL DEFAULT 70,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'properties_confidence_score_chk'
  ) THEN
    ALTER TABLE properties
      ADD CONSTRAINT properties_confidence_score_chk CHECK (confidence_score BETWEEN 0 AND 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'properties_verification_source_chk'
  ) THEN
    ALTER TABLE properties
      ADD CONSTRAINT properties_verification_source_chk CHECK (verification_source IN ('agent', 'system', 'manual', 'unverified'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS properties_trust_idx
  ON properties (verification_source, confidence_score, updated_at DESC);

CREATE OR REPLACE FUNCTION set_row_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS properties_set_updated_at ON properties;
CREATE TRIGGER properties_set_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION set_row_updated_at();

CREATE TABLE IF NOT EXISTS listing_verification_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  verified_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  verification_source TEXT NOT NULL,
  confidence_score INT NOT NULL,
  evidence_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT listing_verification_source_chk CHECK (verification_source IN ('agent', 'system', 'manual', 'unverified')),
  CONSTRAINT listing_verification_confidence_chk CHECK (confidence_score BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS listing_verification_property_idx
  ON listing_verification_events (property_id, created_at DESC);

CREATE TABLE IF NOT EXISTS agent_marketplace_profiles (
  agent_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  elite_verified_at TIMESTAMPTZ,
  manually_seeded BOOLEAN NOT NULL DEFAULT FALSE,
  response_sla_minutes INT NOT NULL DEFAULT 5,
  rolling_response_minutes NUMERIC(8,2),
  marketplace_status TEXT NOT NULL DEFAULT 'private_beta',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT agent_marketplace_status_chk CHECK (marketplace_status IN ('private_beta', 'elite_verified', 'paused', 'public')),
  CONSTRAINT agent_marketplace_response_sla_chk CHECK (response_sla_minutes <= 5)
);

DROP TRIGGER IF EXISTS agent_marketplace_profiles_set_updated_at ON agent_marketplace_profiles;
CREATE TRIGGER agent_marketplace_profiles_set_updated_at
  BEFORE UPDATE ON agent_marketplace_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_row_updated_at();

CREATE TABLE IF NOT EXISTS deal_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES buyers(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deal_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES deal_conversations(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL,
  body TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'in_platform',
  external_delivery_id TEXT,
  agent_approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT deal_messages_sender_role_chk CHECK (sender_role IN ('agent', 'buyer', 'landlord', 'system', 'ai')),
  CONSTRAINT deal_messages_channel_chk CHECK (channel IN ('in_platform', 'whatsapp_delivery', 'email_delivery', 'offline_note'))
);

CREATE INDEX IF NOT EXISTS deal_conversations_agent_idx
  ON deal_conversations (agent_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS deal_messages_conversation_idx
  ON deal_messages (conversation_id, created_at);
