ALTER TABLE referral_campaigns
  ADD COLUMN IF NOT EXISTS drafted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cron_last_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS valuation_growth_percent NUMERIC(8,2);

CREATE INDEX IF NOT EXISTS referral_campaigns_scheduler_idx
  ON referral_campaigns (status, due_at)
  WHERE status IN ('scheduled', 'drafted');
