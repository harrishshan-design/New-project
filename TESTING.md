# RealityGenius Testing Guide

## Quick Automated Checks

Run against production:

```bash
npm run test:e2e
```

Run against another target:

```bash
$env:RG_BASE_URL="http://localhost:3000"; npm run test:e2e
```

The current automated suite verifies:

- Guests cannot access `agent.html`, `admin.html`, or `master.html`.
- Buyer page can be browsed before login.
- Buyer protected actions redirect to login.
- Invalid login stays on the login page.
- Agent billing API requires auth.
- Agent profile API requires auth.
- Stripe webhook rejects unsigned payloads.

## Manual Role Credentials

Do not hardcode admin or master credentials in frontend files. Use Supabase Auth or your approved backend process to create these test accounts.

Suggested test accounts:

- Buyer: `rg-buyer-test@example.com`
- Pending agent: `rg-pending-agent-test@example.com`
- Approved agent: `rg-agent-test@example.com`
- Admin: `rg-admin-test@example.com`
- Master: `rg-master-test@example.com`

Store passwords in a password manager or local `.env.test`, not in committed files.

## Buyer Flow Checklist

- Register a buyer account.
- Login as buyer.
- Search by area, tower, or landmark.
- Open a property card.
- Check image gallery thumbnails and main image.
- Save/favourite property.
- Open saved drawer/section and confirm the property appears.
- Contact agent link opens WhatsApp with a relevant message.
- Submit booking/inquiry form with valid values.
- Invalid/empty form fields are blocked.
- Logout clears session and protected actions ask for login again.
- Invalid login fails.

## Agent Flow Checklist

- Register as agent.
- Confirm pending agent cannot open `agent.html`.
- Approve agent in admin/Supabase.
- Login as approved agent.
- Add listing manually.
- Upload at least the required property images.
- Upload Excel template and confirm listing drafts are created.
- Submit listing for admin QC.
- Use AI Content Creator.
- Check leads panel.
- Edit/delete listing where UI supports it.
- Confirm launch mode opens all features for now.
- When paid mode is restored, confirm locked features stay locked until Stripe webhook updates the profile.
- Logout and confirm `agent.html` redirects to login.

## Admin Flow Checklist

- Login as admin.
- View agent queue.
- Approve/reject pending agents.
- View pending listings.
- Approve/reject listings.
- Confirm approved listing is published to buyer page.
- Review Telegram AI imports.
- Approve Telegram import and confirm it becomes buyer-visible.
- Confirm rejected imports/listings do not appear to buyers.
- Confirm admin cannot open master-only dashboard.

## Master Flow Checklist

- Login as master.
- View platform-wide users, agents, admins, and operational panels.
- Test platform setting controls.
- Check role permissions.
- Confirm buyer, agent, and admin sessions cannot open master dashboard.
- Confirm localStorage edits cannot bypass master auth gate.

## Security Checklist

- Invalid login does not create `rg_session` or `rg_token`.
- Buyer cannot access `agent.html`, `admin.html`, or `master.html`.
- Agent cannot access `admin.html` or `master.html`.
- Pending agent cannot access approved agent dashboard.
- LocalStorage-only fake sessions redirect to login.
- API routes validate JWT/session before returning private data.
- Agent billing requires a real approved agent profile.
- Admin APIs require admin protection and should not rely only on localStorage.
- Supabase RLS is enabled on exposed tables.
- Frontend contains no `service_role`, Stripe secret, webhook secret, Telegram token, or admin API key.
- Forms validate required fields and safe input lengths.

## Payment Flow Checklist

- Stripe Checkout button opens only for approved agent sessions when paid mode is enabled.
- Missing price IDs return a clear error.
- Success URL returns to `agent.html?payment=success`.
- Cancel URL returns to `agent.html?payment=cancelled`.
- Webhook rejects unsigned calls.
- Signed `checkout.session.completed` updates agent subscription profile.
- Subscription update/delete changes plan status.
- Free users cannot use paid features after launch mode is disabled.

## Telegram Import Checklist

- Webhook requires `X-Telegram-Bot-Api-Secret-Token` when configured.
- New Telegram user is asked for full name, email, phone, and optional REN ID.
- `skip` works for REN ID.
- Photos/details are stored into an import session.
- AI extraction creates title, location, price, bedrooms, bathrooms, type, description, and image URLs.
- Admin can review and edit import.
- Admin approval creates/links the agent profile.
- Approved import appears on the buyer live page.
