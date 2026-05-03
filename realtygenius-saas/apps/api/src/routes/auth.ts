import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query } from "../db/pool.js";
import { HttpError } from "../http/errors.js";
import { requireAuth, signToken, type Role } from "../http/auth.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const body = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(8),
    role: z.enum(["buyer", "agent"]).default("buyer"),
    agencyName: z.string().optional(),
    renId: z.string().optional()
  }).parse(req.body);

  const hash = await bcrypt.hash(body.password, 12);
  const result = await query<{ id: string; email: string; role: Role; name: string }>(
    `INSERT INTO users (name, email, phone, password_hash, role, agency_name, ren_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, email, role, name`,
    [body.name, body.email.toLowerCase(), body.phone, hash, body.role, body.agencyName, body.renId]
  );

  const user = result.rows[0];
  res.status(201).json({ token: signToken(user), user });
});

authRouter.post("/login", async (req, res) => {
  const body = z.object({
    email: z.string().email(),
    password: z.string()
  }).parse(req.body);

  const result = await query<{ id: string; email: string; role: Role; password_hash: string; name: string; status: string | null }>(
    "SELECT id, email, role, password_hash, name, status FROM users WHERE email = $1",
    [body.email.toLowerCase()]
  );
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(body.password, user.password_hash))) {
    throw new HttpError(401, "Invalid login credentials");
  }
  if (user.status && user.status !== "active") {
    throw new HttpError(403, `Account is ${user.status}`);
  }

  res.json({
    token: signToken({ id: user.id, email: user.email, role: user.role }),
    user: { id: user.id, email: user.email, role: user.role, name: user.name }
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const result = await query<{ id: string; email: string; role: Role; name: string; phone: string | null; agency_name: string | null; ren_id: string | null; status: string | null }>(
    "SELECT id, email, role, name, phone, agency_name, ren_id, status FROM users WHERE id = $1",
    [req.user!.id]
  );
  if (!result.rows[0]) throw new HttpError(404, "User not found");
  res.json(result.rows[0]);
});
