import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { findProfileByEmail, findProfileById } from "../db/profiles.js";
import { HttpError } from "./errors.js";

export type Role = "buyer" | "agent" | "admin" | "master";

export type AuthUser = {
  id: string;
  role: Role;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return next(new HttpError(401, "Missing bearer token"));

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    const profile = await findProfileById(decoded.id) || await findProfileByEmail(decoded.email);
    if (!profile) throw new HttpError(401, "Profile not found");
    if (profile.status && !["active", "approved"].includes(profile.status)) {
      throw new HttpError(403, `Account is ${profile.status}`);
    }
    req.user = {
      id: profile.id,
      email: profile.email,
      role: profile.role
    };
    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, "Invalid or expired token"));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new HttpError(401, "Unauthenticated");
    if (!roles.includes(req.user.role)) throw new HttpError(403, "Insufficient permissions");
    next();
  };
}
