import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { requireAuth } from "../http/auth.js";
import { sendEmail, sendWhatsApp } from "../services/notifications.js";
import { draftReferralCampaign, runReferralAutomation } from "../services/referralLifecycle.js";

export const referralsRouter = Router();
referralsRouter.use(requireAuth);

referralsRouter.post("/deals", async (req, res) => {
  const body = z.object({
    buyerId: z.string().uuid(),
    propertyId: z.string().uuid(),
    closedAt: z.string(),
    closedPrice: z.number(),
    commissionAmount: z.number()
  }).parse(req.body);

  const deal = await query(
    `INSERT INTO closed_deals (agent_id, buyer_id, property_id, closed_at, closed_price, commission_amount)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user!.id, body.buyerId, body.propertyId, body.closedAt, body.closedPrice, body.commissionAmount]
  );

  for (const year of [1, 2, 3, 4, 5]) {
    await query(
      `INSERT INTO referral_campaigns (deal_id, agent_id, buyer_id, anniversary_year, due_at)
       VALUES ($1,$2,$3,$4,($5::date + ($4 || ' years')::interval)::date)`,
      [deal.rows[0].id, req.user!.id, body.buyerId, year, body.closedAt]
    );
  }

  res.status(201).json(deal.rows[0]);
});

referralsRouter.post("/:id/draft", async (req, res) => {
  const saved = await draftReferralCampaign(req.params.id, req.user!.id);
  res.json(saved);
});

referralsRouter.post("/:id/send", async (req, res) => {
  const result = await query(
    `SELECT c.*, b.phone, b.email FROM referral_campaigns c JOIN buyers b ON b.id = c.buyer_id
     WHERE c.id = $1 AND c.agent_id = $2`,
    [req.params.id, req.user!.id]
  );
  const campaign = result.rows[0];
  const sends = await Promise.all([
    campaign.phone ? sendWhatsApp(campaign.phone, campaign.whatsapp_draft, { agentApproved: true }) : null,
    campaign.email ? sendEmail(campaign.email, campaign.email_subject, campaign.email_body, { agentApproved: true }) : null
  ]);
  await query("UPDATE referral_campaigns SET status = 'sent', sent_at = NOW() WHERE id = $1", [req.params.id]);
  res.json({ sent: sends });
});

referralsRouter.post("/cron/run", async (req, res) => {
  res.json(await runReferralAutomation(req.user!.id));
});

referralsRouter.get("/due", async (req, res) => {
  const result = await query(
    `SELECT c.*, b.name buyer_name, p.title property_title
     FROM referral_campaigns c
     JOIN buyers b ON b.id = c.buyer_id
     JOIN closed_deals d ON d.id = c.deal_id
     JOIN properties p ON p.id = d.property_id
     WHERE c.agent_id = $1 AND c.due_at <= CURRENT_DATE + INTERVAL '30 days'
     ORDER BY c.due_at ASC`,
    [req.user!.id]
  );
  res.json(result.rows);
});
