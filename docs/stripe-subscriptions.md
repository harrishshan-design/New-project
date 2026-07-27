# Stripe Agent Subscriptions

RealityGenius uses Stripe Checkout Sessions for recurring agent plans.

## Environment variables

Set these on the backend/API service:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_STARTER_PRICE_ID
STRIPE_PRO_PRICE_ID
STRIPE_ELITE_PRICE_ID
FRONTEND_URL=https://realitygenius.company
```

## Endpoints

Checkout:

```text
POST /api/billing/create-checkout-session
POST /api/create-checkout-session
POST /api/stripe/create-checkout-session
```

Body:

```json
{
  "plan": "starter_rg"
}
```

Supported plans:

```text
starter_rg
elite_agent
```

Webhook:

```text
POST /api/stripe/webhook
```

Listen for:

```text
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
```

The webhook must be configured with `STRIPE_WEBHOOK_SECRET`; unsigned webhook payloads are rejected. The webhook updates the agent `users.profile_json.subscription` record in Supabase.

It also writes these top-level columns for fast SaaS feature checks:

```text
users.plan
users.subscription_plan
users.subscription_status
users.stripe_customer_id
users.stripe_subscription_id
users.auction_slots_monthly
users.features_unlocked
```

Run migration `realtygenius-saas/db/migrations/013_agent_subscription_plan_columns.sql` before relying on webhook unlocks.

## Feature gates

RealityGenius agent plans unlock features like this:

```text
free          = listing upload only, premium tools locked
starter_rg    = AI Content Creator, WhatsApp follow-ups, AR demo
elite_agent   = Starter plus document vault, DSR, itinerary, co-broke, 1 auction slot/month
best_closers  = manual approval plan with 4 auction slots/month and team features
```

Frontend locks guide the user to upgrade. Redirect success only shows a verification state; premium unlocks should come from `/api/agent/me` after Stripe webhook updates Supabase.
