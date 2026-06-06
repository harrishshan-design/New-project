import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
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

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new HttpError(401, "Missing bearer token");

  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    next();
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new HttpError(401, "Unauthenticated");
    if (!roles.includes(req.user.role)) throw new HttpError(403, "Insufficient permissions");
    next();
  };
}
