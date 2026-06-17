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
POST /api/create-checkout-session
POST /api/stripe/create-checkout-session
```

Body:

```json
{ "plan": "starter" }
```

Supported plans:

```text
starter
pro
elite
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
```

The webhook updates the agent `users.profile_json.subscription` record in Supabase.
