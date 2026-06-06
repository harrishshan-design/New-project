# Telegram AI Listing Imports

RealityGenius can import property posts from Telegram, extract listing details with AI, save them to Supabase, notify admin, and keep them out of the buyer feed until admin approves them.

## Required Environment Variables

Set these in Render for the API service. These are backend-only values.

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SECRET_KEY
OPENAI_API_KEY
TELEGRAM_BOT_TOKEN
TELEGRAM_WEBHOOK_SECRET
ADMIN_API_KEY
FRONTEND_URL
```

Important:

- `SUPABASE_URL` can be either the project URL or the REST URL ending in `/rest/v1`; the backend normalizes it.
- `SUPABASE_SERVICE_ROLE_KEY` must be the real Supabase service role/secret key. `SUPABASE_SECRET_KEY` is also supported as an alias. A publishable key will not be enough for RLS-protected writes.
- `FRONTEND_URL` should be your production website origin, for example `https://realitygenius.company`.
- Rotate any token that was pasted into chat or logs before production.
- Do not put `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, or `ADMIN_API_KEY` in Vercel frontend env.

## Supabase Migration

Apply:

```bash
realtygenius-saas/db/migrations/007_telegram_ai_imports.sql
```

It creates:

- `telegram_raw_messages`
- `ai_imported_listings`
- `admin_notifications`

Statuses:

```text
needs_review
approved
rejected
live
```

Only `approved` and `live` imports are returned by the public `/api/properties` endpoint.

## Render Setup

In the Render web service for the RealityGenius API:

1. Open `Environment`.
2. Add the required environment variables.
3. Confirm the start command still runs the Node backend, for example:

```bash
npm start
```

4. Redeploy.
5. Confirm health:

```bash
curl https://api.realitygenius.company/api/properties
```

## Vercel Setup

In Vercel, the static site normally calls:

```text
https://api.realitygenius.company/api
```

If you need to override that, define:

```text
REALTYGENIUS_API_BASE=https://your-render-api.example.com/api
```

The build generates `/rg-config.js` from public frontend env values only:

```text
REALTYGENIUS_SUPABASE_URL
REALTYGENIUS_SUPABASE_PUBLISHABLE_KEY
REALTYGENIUS_API_BASE
VITE_API_URL
```

For the admin review UI, paste the `ADMIN_API_KEY` once into the AI Imports panel. It is stored only in the browser localStorage for that admin device.

## Telegram Webhook Setup

After the Render API is deployed, register the webhook:

```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"https://api.realitygenius.company/api/telegram/webhook\",\"secret_token\":\"$TELEGRAM_WEBHOOK_SECRET\"}"
```

Telegram sends the secret token in:

```text
X-Telegram-Bot-Api-Secret-Token
```

The backend rejects webhook calls without the correct secret.

## Workflow

1. Telegram post arrives at `/api/telegram/webhook`.
2. Backend verifies the Telegram secret header.
3. Raw update is stored in `telegram_raw_messages`.
4. OpenAI extracts listing fields.
5. Listing is saved as `needs_review` in `ai_imported_listings`.
6. Admin notification is created.
7. Admin opens `Admin > AI Imports`.
8. Admin edits, approves, rejects, or marks live.
9. Buyer website only receives `approved` or `live` imports from `/api/properties`.

## Manual Test Checklist

1. Apply the Supabase migration.
2. Set all Render environment variables.
3. Redeploy Render API.
4. Register Telegram webhook.
5. Forward a property post to the bot or post in a channel where the bot is admin.
6. Check `telegram_raw_messages` has the raw update.
7. Check `ai_imported_listings` has a `needs_review` row.
8. Open Admin dashboard, go to `AI Imports`, save the admin API key, and refresh.
9. Edit missing fields and click `Approve + Live`.
10. Open buyer website and confirm the listing appears only after approval.
11. Reject another import and confirm it never appears in the buyer feed.
