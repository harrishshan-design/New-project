ALTER TABLE document_vaults
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ;

ALTER TABLE buyer_documents
  ADD COLUMN IF NOT EXISTS upload_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS processing_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processing_error TEXT;

CREATE INDEX IF NOT EXISTS document_vaults_magic_token_active_idx
  ON document_vaults (magic_token, expires_at)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS buyer_documents_vault_type_idx
  ON buyer_documents (vault_id, type);

CREATE INDEX IF NOT EXISTS dsr_assessments_buyer_latest_idx
  ON dsr_assessments (buyer_id, created_at DESC);
