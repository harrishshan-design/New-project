# RealtyGenius SaaS

Production-ready SaaS scaffold for Malaysian property agents.

```bash
cp .env.example .env
npm install
npm run dev:api
npm run dev
```

Run `db/migrations/001_init.sql` against PostgreSQL before starting the API.

Apply the migrations in order:

```bash
psql "$DATABASE_URL" -f db/migrations/001_init.sql
psql "$DATABASE_URL" -f db/migrations/002_document_vault_hardening.sql
psql "$DATABASE_URL" -f db/migrations/003_cobroke_matching_esign.sql
psql "$DATABASE_URL" -f db/migrations/004_referral_lifecycle_automation.sql
psql "$DATABASE_URL" -f db/migrations/005_trust_integrity_marketplace.sql
psql "$DATABASE_URL" -f db/migrations/006_auth_data_ai_platform.sql
psql "$DATABASE_URL" -f db/seeds/001_demo_users.sql
```

Demo logins use `ChangeMe123!`:

- `buyer@realtygenius.my`
- `agent@realtygenius.my`
- `admin@realtygenius.my`

For local Pinokio AI, point `PINOKIO_BASE_URL` at an OpenAI-compatible Pinokio app endpoint and keep `AI_PROVIDER=auto` or `AI_PROVIDER=pinokio`.
