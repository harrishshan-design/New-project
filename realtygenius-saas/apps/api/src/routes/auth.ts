import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { findProfileByEmail, upsertProfile } from "../db/profiles.js";
import { HttpError } from "../http/errors.js";
import { requireAuth, signToken, type Role } from "../http/auth.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const body = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
    password: z.string().min(8),
    role: z.enum(["buyer", "agent"]).default("buyer"),
    agencyName: z.string().optional(),
    renId: z.string().optional()
  }).parse(req.body);

  const hash = await bcrypt.hash(body.password, 12);
  const existing = await findProfileByEmail(body.email);
  if (existing) throw new HttpError(409, "Email is already registered");

  const profile = await upsertProfile({
    fullName: body.name,
    email: body.email,
    phone: body.phone,
    passwordHash: hash,
    role: body.role,
    agencyName: body.agencyName,
    renId: body.renId || null,
    status: body.role === "agent" ? "pending" : "active"
  });
  const user = { id: profile.id, email: profile.email, role: profile.role as Role, name: profile.full_name || profile.name || body.name };
  res.status(201).json({ token: signToken(user), user });
});

authRouter.post("/login", async (req, res) => {
  const body = z.object({
    email: z.string().email(),
    password: z.string()
  }).parse(req.body);

  const user = await findProfileByEmail(body.email);
  if (!user?.password_hash || !(await bcrypt.compare(body.password, user.password_hash))) {
    throw new HttpError(401, "Invalid login credentials");
  }
  if (user.status && user.status !== "active") {
    throw new HttpError(403, `Account is ${user.status}`);
  }

  res.json({
    token: signToken({ id: user.id, email: user.email, role: user.role }),
    user: { id: user.id, email: user.email, role: user.role, name: user.full_name || user.name }
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const profile = await findProfileByEmail(req.user!.email);
  if (!profile) throw new HttpError(404, "User not found");
  res.json({
    id: profile.id,
    email: profile.email,
    role: profile.role,
    name: profile.full_name || profile.name,
    phone: profile.phone,
    agency_name: profile.agency_name,
    ren_id: profile.ren_id,
    status: profile.status
  });
});
