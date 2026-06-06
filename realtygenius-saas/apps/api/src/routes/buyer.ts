import { Router } from "express";
import { z } from "zod";
import { query, transaction } from "../db/pool.js";
import { requireAuth, requireRole } from "../http/auth.js";
import { HttpError } from "../http/errors.js";
import { buildListingTrustState, normalizeVerificationSource } from "../services/survivalPolicy.js";

export const buyerRouter = Router();
buyerRouter.use(requireAuth, requireRole("buyer"));

type PropertyRow = {
  id: string;
  agent_id: string;
  title: string;
  address: string;
  area: string;
  property_type: string | null;
  asking_price: string;
  image_url: string | null;
  created_at: string;
  updated_at?: string | null;
  last_verified_at?: string | null;
  confidence_score?: number | string | null;
  verification_source?: string | null;
};

function withTrustState<T extends PropertyRow>(property: T) {
  return {
    ...property,
    trustState: buildListingTrustState({
      updatedAt: property.updated_at || property.created_at,
      lastVerifiedAt: property.last_verified_at,
      confidenceScore: property.confidence_score,
      verificationSource: normalizeVerificationSource(property.verification_source)
    })
  };
}

buyerRouter.get("/properties", async (req, res) => {
  const filters = z.object({
    area: z.string().optional(),
    propertyType: z.string().optional(),
    budgetMax: z.coerce.number().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(24)
  }).parse(req.query);

  const conditions = ["p.archived_at IS NULL"];
  const params: unknown[] = [];
  if (filters.area) {
    params.push(`%${filters.area}%`);
    conditions.push(`p.area ILIKE $${params.length}`);
  }
  if (filters.propertyType) {
    params.push(filters.propertyType);
    conditions.push(`p.property_type = $${params.length}`);
  }
  if (filters.budgetMax) {
    params.push(filters.budgetMax);
    conditions.push(`p.asking_price <= $${params.length}`);
  }
  params.push(filters.limit);

  const result = await query<PropertyRow & { agent_name: string; agency_name: string | null; saved: boolean }>(
    `SELECT p.*, u.name agent_name, u.agency_name,
            EXISTS (SELECT 1 FROM saved_homes sh WHERE sh.property_id = p.id AND sh.buyer_user_id = $${params.length + 1}) saved
     FROM properties p
     JOIN users u ON u.id = p.agent_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY p.confidence_score DESC, p.updated_at DESC
     LIMIT $${params.length}`,
    [...params, req.user!.id]
  );

  res.json(result.rows.map(withTrustState));
});

buyerRouter.get("/saved-homes", async (req, res) => {
  const result = await query<PropertyRow & { saved_at: string; agent_name: string }>(
    `SELECT p.*, sh.created_at saved_at, u.name agent_name
     FROM saved_homes sh
     JOIN properties p ON p.id = sh.property_id
     JOIN users u ON u.id = p.agent_id
     WHERE sh.buyer_user_id = $1
     ORDER BY sh.created_at DESC`,
    [req.user!.id]
  );
  res.json(result.rows.map(withTrustState));
});

buyerRouter.post("/saved-homes", async (req, res) => {
  const body = z.object({ propertyId: z.string().uuid() }).parse(req.body);
  const result = await query(
    `INSERT INTO saved_homes (buyer_user_id, property_id)
     VALUES ($1,$2)
     ON CONFLICT (buyer_user_id, property_id) DO NOTHING
     RETURNING *`,
    [req.user!.id, body.propertyId]
  );
  res.status(201).json(result.rows[0] || { buyer_user_id: req.user!.id, property_id: body.propertyId, saved: true });
});

buyerRouter.delete("/saved-homes/:propertyId", async (req, res) => {
  await query("DELETE FROM saved_homes WHERE buyer_user_id = $1 AND property_id = $2", [req.user!.id, req.params.propertyId]);
  res.status(204).send();
});

buyerRouter.post("/bookings", async (req, res) => {
  const body = z.object({
    propertyId: z.string().uuid(),
    viewingStartAt: z.string().datetime().optional(),
    buyerNote: z.string().max(1000).optional()
  }).parse(req.body);

  const property = await query<{ id: string; agent_id: string }>(
    "SELECT id, agent_id FROM properties WHERE id = $1 AND archived_at IS NULL",
    [body.propertyId]
  );
  if (!property.rows[0]) throw new HttpError(404, "Property not found");

  const result = await query(
    `INSERT INTO bookings (buyer_user_id, agent_id, property_id, viewing_start_at, buyer_note)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [req.user!.id, property.rows[0].agent_id, body.propertyId, body.viewingStartAt, body.buyerNote]
  );
  res.status(201).json(result.rows[0]);
});

buyerRouter.get("/bookings", async (req, res) => {
  const result = await query(
    `SELECT b.*, p.title property_title, p.address, p.image_url, u.name agent_name, u.phone agent_phone
     FROM bookings b
     JOIN properties p ON p.id = b.property_id
     JOIN users u ON u.id = b.agent_id
     WHERE b.buyer_user_id = $1
     ORDER BY b.updated_at DESC`,
    [req.user!.id]
  );
  res.json(result.rows);
});

buyerRouter.post("/negotiations", async (req, res) => {
  const body = z.object({
    propertyId: z.string().uuid(),
    message: z.string().min(2).max(2000),
    offerPrice: z.number().positive().optional()
  }).parse(req.body);

  const property = await query<{ id: string; agent_id: string }>(
    "SELECT id, agent_id FROM properties WHERE id = $1 AND archived_at IS NULL",
    [body.propertyId]
  );
  if (!property.rows[0]) throw new HttpError(404, "Property not found");

  const created = await transaction(async (client) => {
    const thread = await client.query(
      `INSERT INTO negotiation_threads (buyer_user_id, agent_id, property_id, status)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user!.id, property.rows[0].agent_id, body.propertyId, body.offerPrice ? "offer_made" : "active"]
    );
    const message = await client.query(
      `INSERT INTO negotiation_messages (thread_id, sender_user_id, sender_role, body, offer_price)
       VALUES ($1,$2,'buyer',$3,$4) RETURNING *`,
      [thread.rows[0].id, req.user!.id, body.message, body.offerPrice]
    );
    return { thread: thread.rows[0], message: message.rows[0] };
  });

  res.status(201).json(created);
});

buyerRouter.post("/negotiations/:threadId/messages", async (req, res) => {
  const body = z.object({
    message: z.string().min(2).max(2000),
    offerPrice: z.number().positive().optional()
  }).parse(req.body);

  const thread = await query<{ id: string }>(
    "SELECT id FROM negotiation_threads WHERE id = $1 AND buyer_user_id = $2",
    [req.params.threadId, req.user!.id]
  );
  if (!thread.rows[0]) throw new HttpError(404, "Negotiation not found");

  const result = await query(
    `INSERT INTO negotiation_messages (thread_id, sender_user_id, sender_role, body, offer_price)
     VALUES ($1,$2,'buyer',$3,$4) RETURNING *`,
    [req.params.threadId, req.user!.id, body.message, body.offerPrice]
  );
  await query(
    "UPDATE negotiation_threads SET status = CASE WHEN $1::numeric IS NULL THEN status ELSE 'offer_made' END WHERE id = $2",
    [body.offerPrice ?? null, req.params.threadId]
  );
  res.status(201).json(result.rows[0]);
});

buyerRouter.get("/negotiations", async (req, res) => {
  const result = await query(
    `SELECT nt.*, p.title property_title, p.asking_price, u.name agent_name,
            latest.body latest_message, latest.created_at latest_message_at
     FROM negotiation_threads nt
     JOIN properties p ON p.id = nt.property_id
     JOIN users u ON u.id = nt.agent_id
     LEFT JOIN LATERAL (
       SELECT body, created_at FROM negotiation_messages
       WHERE thread_id = nt.id
       ORDER BY created_at DESC
       LIMIT 1
     ) latest ON true
     WHERE nt.buyer_user_id = $1
     ORDER BY nt.updated_at DESC`,
    [req.user!.id]
  );
  res.json(result.rows);
});
