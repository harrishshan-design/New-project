import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { requireAuth, requireRole } from "../http/auth.js";
import { HttpError } from "../http/errors.js";

export const agentRouter = Router();
agentRouter.use(requireAuth, requireRole("agent"));

agentRouter.get("/leads", async (req, res) => {
  const result = await query(
    "SELECT * FROM leads WHERE agent_id = $1 ORDER BY updated_at DESC",
    [req.user!.id]
  );
  res.json(result.rows);
});

agentRouter.post("/leads", async (req, res) => {
  const body = z.object({
    name: z.string().min(2),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    preferredArea: z.string().optional(),
    propertyType: z.string().optional(),
    budgetMin: z.number().optional(),
    budgetMax: z.number().optional(),
    source: z.string().default("agent_dashboard"),
    status: z.enum(["new", "qualified", "viewing", "negotiating", "closed", "lost"]).default("new"),
    score: z.number().int().min(0).max(100).default(50),
    notes: z.string().optional()
  }).parse(req.body);

  const result = await query(
    `INSERT INTO leads (
       agent_id, name, phone, email, preferred_area, property_type, budget_min, budget_max, source, status, score, notes
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      req.user!.id,
      body.name,
      body.phone,
      body.email,
      body.preferredArea,
      body.propertyType,
      body.budgetMin,
      body.budgetMax,
      body.source,
      body.status,
      body.score,
      body.notes
    ]
  );
  res.status(201).json(result.rows[0]);
});

agentRouter.patch("/leads/:id", async (req, res) => {
  const body = z.object({
    status: z.enum(["new", "qualified", "viewing", "negotiating", "closed", "lost"]).optional(),
    score: z.number().int().min(0).max(100).optional(),
    notes: z.string().optional()
  }).parse(req.body);

  const result = await query(
    `UPDATE leads
     SET status = COALESCE($1, status),
         score = COALESCE($2, score),
         notes = COALESCE($3, notes)
     WHERE id = $4 AND agent_id = $5
     RETURNING *`,
    [body.status, body.score, body.notes, req.params.id, req.user!.id]
  );
  if (!result.rows[0]) throw new HttpError(404, "Lead not found");
  res.json(result.rows[0]);
});

agentRouter.get("/bookings", async (req, res) => {
  const result = await query(
    `SELECT b.*, p.title property_title, p.address, buyer.name buyer_name, buyer.email buyer_email, buyer.phone buyer_phone
     FROM bookings b
     JOIN properties p ON p.id = b.property_id
     JOIN users buyer ON buyer.id = b.buyer_user_id
     WHERE b.agent_id = $1
     ORDER BY b.updated_at DESC`,
    [req.user!.id]
  );
  res.json(result.rows);
});

agentRouter.patch("/bookings/:id", async (req, res) => {
  const body = z.object({
    status: z.enum(["requested", "confirmed", "rescheduled", "completed", "cancelled"]).optional(),
    viewingStartAt: z.string().datetime().optional(),
    agentNote: z.string().max(1000).optional()
  }).parse(req.body);

  const result = await query(
    `UPDATE bookings
     SET status = COALESCE($1, status),
         viewing_start_at = COALESCE($2, viewing_start_at),
         agent_note = COALESCE($3, agent_note)
     WHERE id = $4 AND agent_id = $5
     RETURNING *`,
    [body.status, body.viewingStartAt, body.agentNote, req.params.id, req.user!.id]
  );
  if (!result.rows[0]) throw new HttpError(404, "Booking not found");
  res.json(result.rows[0]);
});

agentRouter.get("/negotiations", async (req, res) => {
  const result = await query(
    `SELECT nt.*, p.title property_title, p.asking_price, buyer.name buyer_name,
            latest.body latest_message, latest.sender_role latest_sender_role, latest.created_at latest_message_at
     FROM negotiation_threads nt
     JOIN properties p ON p.id = nt.property_id
     JOIN users buyer ON buyer.id = nt.buyer_user_id
     LEFT JOIN LATERAL (
       SELECT body, sender_role, created_at FROM negotiation_messages
       WHERE thread_id = nt.id
       ORDER BY created_at DESC
       LIMIT 1
     ) latest ON true
     WHERE nt.agent_id = $1
     ORDER BY nt.updated_at DESC`,
    [req.user!.id]
  );
  res.json(result.rows);
});

agentRouter.get("/negotiations/:threadId/messages", async (req, res) => {
  const access = await query<{ id: string }>(
    "SELECT id FROM negotiation_threads WHERE id = $1 AND agent_id = $2",
    [req.params.threadId, req.user!.id]
  );
  if (!access.rows[0]) throw new HttpError(404, "Negotiation not found");

  const messages = await query(
    "SELECT * FROM negotiation_messages WHERE thread_id = $1 ORDER BY created_at",
    [req.params.threadId]
  );
  res.json(messages.rows);
});

agentRouter.post("/negotiations/:threadId/messages", async (req, res) => {
  const body = z.object({
    message: z.string().min(2).max(2000),
    offerPrice: z.number().positive().optional(),
    markAccepted: z.boolean().default(false)
  }).parse(req.body);

  const access = await query<{ id: string }>(
    "SELECT id FROM negotiation_threads WHERE id = $1 AND agent_id = $2",
    [req.params.threadId, req.user!.id]
  );
  if (!access.rows[0]) throw new HttpError(404, "Negotiation not found");

  const result = await query(
    `INSERT INTO negotiation_messages (thread_id, sender_user_id, sender_role, body, offer_price, agent_approved_at)
     VALUES ($1,$2,'agent',$3,$4,NOW()) RETURNING *`,
    [req.params.threadId, req.user!.id, body.message, body.offerPrice]
  );

  await query(
    `UPDATE negotiation_threads
     SET status = CASE WHEN $1 THEN 'accepted' WHEN $2::numeric IS NULL THEN status ELSE 'offer_made' END,
         accepted_offer_price = CASE WHEN $1 THEN $2 ELSE accepted_offer_price END
     WHERE id = $3`,
    [body.markAccepted, body.offerPrice ?? null, req.params.threadId]
  );
  res.status(201).json(result.rows[0]);
});

agentRouter.get("/commissions", async (req, res) => {
  const result = await query(
    `SELECT c.*, p.title property_title, buyer.name buyer_name
     FROM commissions c
     LEFT JOIN properties p ON p.id = c.property_id
     LEFT JOIN users buyer ON buyer.id = c.buyer_user_id
     WHERE c.agent_id = $1
     ORDER BY c.updated_at DESC`,
    [req.user!.id]
  );
  res.json(result.rows);
});

agentRouter.post("/commissions", async (req, res) => {
  const body = z.object({
    propertyId: z.string().uuid().optional(),
    buyerUserId: z.string().uuid().optional(),
    sourceType: z.enum(["agent_commission", "bank_referral", "saas_subscription", "escrow_fee"]).default("agent_commission"),
    grossAmount: z.number().positive(),
    platformAmount: z.number().min(0).default(0),
    agentAmount: z.number().min(0).optional(),
    status: z.enum(["pending", "earned", "paid", "cancelled"]).default("pending")
  }).parse(req.body);

  const result = await query(
    `INSERT INTO commissions (
       agent_id, buyer_user_id, property_id, source_type, gross_amount, platform_amount, agent_amount, status
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      req.user!.id,
      body.buyerUserId,
      body.propertyId,
      body.sourceType,
      body.grossAmount,
      body.platformAmount,
      body.agentAmount ?? Math.max(body.grossAmount - body.platformAmount, 0),
      body.status
    ]
  );
  res.status(201).json(result.rows[0]);
});
