import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { requireAuth, requireRole } from "../http/auth.js";
import { HttpError } from "../http/errors.js";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("admin", "master"));

adminRouter.get("/overview", async (_req, res) => {
  const [users, properties, leads, bookings, commissions, negotiations] = await Promise.all([
    query("SELECT role, status, COUNT(*)::int count FROM users GROUP BY role, status ORDER BY role, status"),
    query("SELECT verification_source, COUNT(*)::int count, AVG(confidence_score)::numeric(6,2) avg_confidence FROM properties GROUP BY verification_source"),
    query("SELECT status, COUNT(*)::int count FROM leads GROUP BY status ORDER BY status"),
    query("SELECT status, COUNT(*)::int count FROM bookings GROUP BY status ORDER BY status"),
    query("SELECT status, SUM(gross_amount)::numeric(14,2) gross, SUM(platform_amount)::numeric(14,2) platform FROM commissions GROUP BY status"),
    query("SELECT status, COUNT(*)::int count FROM negotiation_threads GROUP BY status ORDER BY status")
  ]);

  res.json({
    users: users.rows,
    properties: properties.rows,
    leads: leads.rows,
    bookings: bookings.rows,
    commissions: commissions.rows,
    negotiations: negotiations.rows
  });
});

adminRouter.get("/users", async (req, res) => {
  const filters = z.object({
    role: z.enum(["buyer", "agent", "admin", "master"]).optional(),
    status: z.enum(["active", "pending", "suspended", "disabled"]).optional(),
    q: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50)
  }).parse(req.query);

  const conditions = ["1=1"];
  const params: unknown[] = [];
  if (filters.role) {
    params.push(filters.role);
    conditions.push(`role = $${params.length}`);
  }
  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }
  if (filters.q) {
    params.push(`%${filters.q}%`);
    conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length} OR COALESCE(ren_id,'') ILIKE $${params.length})`);
  }
  params.push(filters.limit);

  const result = await query(
    `SELECT id, name, email, phone, role, status, agency_name, ren_id, created_at, updated_at
     FROM users
     WHERE ${conditions.join(" AND ")}
     ORDER BY created_at DESC
     LIMIT $${params.length}`,
    params
  );
  res.json(result.rows);
});

adminRouter.get("/agents", async (_req, res) => {
  const result = await query(
    `SELECT u.id, u.name, u.email, u.phone, u.status, u.agency_name, u.ren_id, u.created_at,
            amp.elite_verified_at, amp.manually_seeded, amp.response_sla_minutes, amp.marketplace_status,
            COUNT(p.id)::int listing_count
     FROM users u
     LEFT JOIN agent_marketplace_profiles amp ON amp.agent_id = u.id
     LEFT JOIN properties p ON p.agent_id = u.id
     WHERE u.role = 'agent'
     GROUP BY u.id, amp.agent_id
     ORDER BY u.created_at DESC`
  );
  res.json(result.rows);
});

adminRouter.patch("/users/:id/status", async (req, res) => {
  const body = z.object({ status: z.enum(["active", "pending", "suspended", "disabled"]) }).parse(req.body);
  const result = await query(
    "UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, role, status",
    [body.status, req.params.id]
  );
  if (!result.rows[0]) throw new HttpError(404, "User not found");
  res.json(result.rows[0]);
});

adminRouter.get("/properties", async (_req, res) => {
  const result = await query(
    `SELECT p.*, u.name agent_name, u.agency_name
     FROM properties p
     JOIN users u ON u.id = p.agent_id
     ORDER BY p.updated_at DESC
     LIMIT 100`
  );
  res.json(result.rows);
});

adminRouter.get("/leads", async (_req, res) => {
  const result = await query(
    `SELECT l.*, u.name agent_name
     FROM leads l
     JOIN users u ON u.id = l.agent_id
     ORDER BY l.updated_at DESC
     LIMIT 100`
  );
  res.json(result.rows);
});

adminRouter.get("/bookings", async (_req, res) => {
  const result = await query(
    `SELECT b.*, p.title property_title, agent.name agent_name, buyer.name buyer_name
     FROM bookings b
     JOIN properties p ON p.id = b.property_id
     JOIN users agent ON agent.id = b.agent_id
     JOIN users buyer ON buyer.id = b.buyer_user_id
     ORDER BY b.updated_at DESC
     LIMIT 100`
  );
  res.json(result.rows);
});

adminRouter.get("/negotiations", async (_req, res) => {
  const result = await query(
    `SELECT nt.*, p.title property_title, agent.name agent_name, buyer.name buyer_name,
            COUNT(nm.id)::int message_count
     FROM negotiation_threads nt
     JOIN properties p ON p.id = nt.property_id
     JOIN users agent ON agent.id = nt.agent_id
     JOIN users buyer ON buyer.id = nt.buyer_user_id
     LEFT JOIN negotiation_messages nm ON nm.thread_id = nt.id
     GROUP BY nt.id, p.id, agent.id, buyer.id
     ORDER BY nt.updated_at DESC
     LIMIT 100`
  );
  res.json(result.rows);
});

adminRouter.get("/commissions", async (_req, res) => {
  const result = await query(
    `SELECT c.*, agent.name agent_name, buyer.name buyer_name, p.title property_title
     FROM commissions c
     JOIN users agent ON agent.id = c.agent_id
     LEFT JOIN users buyer ON buyer.id = c.buyer_user_id
     LEFT JOIN properties p ON p.id = c.property_id
     ORDER BY c.updated_at DESC
     LIMIT 100`
  );
  res.json(result.rows);
});
