import { query } from "./pool.js";

export type ProfileRole = "buyer" | "agent" | "admin" | "master";

export type ProfileRow = {
  id: string;
  email: string;
  role: ProfileRole;
  full_name: string | null;
  name?: string | null;
  phone: string | null;
  agency_name: string | null;
  ren_id: string | null;
  status: string | null;
  password_hash?: string | null;
  profile_json?: Record<string, unknown> | null;
};

let profilesTableAvailable: boolean | null = null;

export async function hasProfilesTable() {
  if (profilesTableAvailable !== null) return profilesTableAvailable;
  const result = await query<{ exists: boolean }>("SELECT to_regclass('public.profiles') IS NOT NULL AS exists");
  profilesTableAvailable = Boolean(result.rows[0]?.exists);
  return profilesTableAvailable;
}

export function normalizePhone(value = "") {
  const digits = String(value || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("60")) return digits;
  if (digits.startsWith("0")) return `6${digits}`;
  return digits.length >= 9 ? digits : "";
}

export function phoneLookupVariants(value = "") {
  const clean = normalizePhone(value);
  if (!clean) return [];
  const variants = new Set([clean, `+${clean}`]);
  if (clean.startsWith("60")) variants.add(`0${clean.slice(2)}`);
  return [...variants];
}

export async function findProfileByEmail(email = "") {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) return null;
  if (await hasProfilesTable()) {
    const result = await query<ProfileRow>(
      `SELECT id, email, role, full_name, full_name AS name, phone, agency_name, ren_id, status, password_hash, profile_json
       FROM profiles
       WHERE lower(email) = $1
       LIMIT 1`,
      [cleanEmail]
    );
    return result.rows[0] || null;
  }
  const result = await query<ProfileRow>(
    "SELECT id, email, role, name AS full_name, name, phone, agency_name, ren_id, status, password_hash, profile_json FROM users WHERE lower(email) = $1 LIMIT 1",
    [cleanEmail]
  );
  return result.rows[0] || null;
}

export async function findProfileById(id = "") {
  if (!id) return null;
  if (await hasProfilesTable()) {
    const result = await query<ProfileRow>(
      `SELECT id, email, role, full_name, full_name AS name, phone, agency_name, ren_id, status, password_hash, profile_json
       FROM profiles
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    return result.rows[0] || null;
  }
  const result = await query<ProfileRow>(
    "SELECT id, email, role, name AS full_name, name, phone, agency_name, ren_id, status, password_hash, profile_json FROM users WHERE id = $1 LIMIT 1",
    [id]
  );
  return result.rows[0] || null;
}

export async function findAgentProfileByPhone(phone = "") {
  const variants = phoneLookupVariants(phone);
  if (!variants.length) return null;
  if (await hasProfilesTable()) {
    const result = await query<ProfileRow>(
      `SELECT id, email, role, full_name, full_name AS name, phone, agency_name, ren_id, status, password_hash, profile_json
       FROM profiles
       WHERE role = 'agent' AND phone = ANY($1::text[])
       LIMIT 1`,
      [variants]
    );
    return result.rows[0] || null;
  }
  const result = await query<ProfileRow>(
    "SELECT id, email, role, name AS full_name, name, phone, agency_name, ren_id, status, password_hash, profile_json FROM users WHERE role = 'agent' AND phone = ANY($1::text[]) LIMIT 1",
    [variants]
  );
  return result.rows[0] || null;
}

export async function upsertProfile(input: {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role: ProfileRole;
  status?: string;
  agencyName?: string;
  renId?: string | null;
  profileJson?: Record<string, unknown>;
}) {
  const email = String(input.email || "").trim().toLowerCase();
  const phone = normalizePhone(input.phone || "");
  const status = input.status || (input.role === "agent" ? "pending" : "active");
  const fullName = input.fullName || email.split("@")[0] || "RealityGenius User";
  const profileJson = input.profileJson || {};

  if (await hasProfilesTable()) {
    const existing = input.id ? null : await findProfileByEmail(email);
    if (input.id || existing?.id) {
      const id = input.id || existing!.id;
      const result = await query<ProfileRow>(
        `UPDATE profiles
         SET full_name = $2,
             email = $3,
             phone = $4,
             role = $5,
             status = $6,
             agency_name = $7,
             ren_id = $8,
             profile_json = COALESCE(profile_json, '{}'::jsonb) || $9::jsonb,
             password_hash = COALESCE($10, password_hash),
             updated_at = now()
         WHERE id = $1
         RETURNING id, email, role, full_name, full_name AS name, phone, agency_name, ren_id, status, password_hash, profile_json`,
        [id, fullName, email, phone || null, input.role, status, input.agencyName || null, input.renId || null, profileJson, input.passwordHash || null]
      );
      return result.rows[0];
    }
    const result = await query<ProfileRow>(
      `INSERT INTO profiles (full_name, email, phone, password_hash, role, status, agency_name, ren_id, profile_json)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, email, role, full_name, full_name AS name, phone, agency_name, ren_id, status, password_hash, profile_json`,
      [fullName, email, phone || null, input.passwordHash || null, input.role, status, input.agencyName || null, input.renId || null, profileJson]
    );
    return result.rows[0];
  }

  const existing = input.id ? null : await findProfileByEmail(email);
  if (input.id || existing?.id) {
    const id = input.id || existing!.id;
    const result = await query<ProfileRow>(
      `UPDATE users
       SET name = $2,
           email = $3,
           phone = $4,
           role = $5,
           status = $6,
           agency_name = $7,
           ren_id = $8,
           profile_json = COALESCE(profile_json, '{}'::jsonb) || $9::jsonb,
           password_hash = COALESCE($10, password_hash),
           updated_at = now()
       WHERE id = $1
       RETURNING id, email, role, name AS full_name, name, phone, agency_name, ren_id, status, password_hash, profile_json`,
      [id, fullName, email, phone || null, input.role, status, input.agencyName || null, input.renId || null, profileJson, input.passwordHash || null]
    );
    return result.rows[0];
  }
  const result = await query<ProfileRow>(
    `INSERT INTO users (name, email, phone, password_hash, role, status, agency_name, ren_id, profile_json)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id, email, role, name AS full_name, name, phone, agency_name, ren_id, status, password_hash, profile_json`,
    [fullName, email, phone || null, input.passwordHash || null, input.role, status, input.agencyName || null, input.renId || null, profileJson]
  );
  return result.rows[0];
}
