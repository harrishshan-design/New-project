import { Router } from "express";
import { z } from "zod";
import { query, transaction } from "../db/pool.js";
import { requireAuth } from "../http/auth.js";
import { buildListingTrustState, normalizeVerificationSource } from "../services/survivalPolicy.js";

export const propertiesRouter = Router();
propertiesRouter.use(requireAuth);

const propertySchema = z.object({
  title: z.string().min(2),
  address: z.string().min(5),
  area: z.string().min(2),
  propertyType: z.string().default("Condo"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  askingPrice: z.number().positive(),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  builtUpSqft: z.number().int().optional(),
  maintenanceFee: z.number().optional(),
  developer: z.string().optional(),
  imageUrl: z.string().url().optional(),
  verificationSource: z.enum(["agent", "system", "manual", "unverified"]).default("agent"),
  confidenceScore: z.number().int().min(0).max(100).default(85),
  lastVerifiedAt: z.string().datetime().optional(),
  verificationEvidence: z.record(z.unknown()).default({}),
  transactions: z.array(z.object({
    transactedPrice: z.number().positive(),
    transactedAt: z.string(),
    unitSizeSqft: z.number().int().optional(),
    source: z.string().default("manual")
  })).default([])
});

propertiesRouter.post("/", async (req, res) => {
  const body = propertySchema.parse(req.body);
  const created = await transaction(async (client) => {
    const property = await client.query(
      `INSERT INTO properties (
         agent_id, title, address, area, property_type, latitude, longitude, asking_price,
         bedrooms, bathrooms, built_up_sqft, maintenance_fee, developer, image_url,
         verification_source, confidence_score, last_verified_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [
        req.user!.id,
        body.title,
        body.address,
        body.area,
        body.propertyType,
        body.latitude,
        body.longitude,
        body.askingPrice,
        body.bedrooms,
        body.bathrooms,
        body.builtUpSqft,
        body.maintenanceFee,
        body.developer,
        body.imageUrl,
        body.verificationSource,
        body.confidenceScore,
        body.lastVerifiedAt ?? new Date().toISOString()
      ]
    );

    await client.query(
      `INSERT INTO listing_verification_events (property_id, verified_by_user_id, verification_source, confidence_score, evidence_json)
       VALUES ($1,$2,$3,$4,$5)`,
      [property.rows[0].id, req.user!.id, body.verificationSource, body.confidenceScore, body.verificationEvidence]
    );

    for (const txn of body.transactions) {
      await client.query(
        `INSERT INTO property_transactions (property_id, transacted_price, transacted_at, unit_size_sqft, source)
         VALUES ($1,$2,$3,$4,$5)`,
        [property.rows[0].id, txn.transactedPrice, txn.transactedAt, txn.unitSizeSqft, txn.source]
      );
    }

    return withTrustState(property.rows[0]);
  });

  res.status(201).json(created);
});

propertiesRouter.get("/", async (req, res) => {
  const result = await query(
    "SELECT * FROM properties WHERE agent_id = $1 ORDER BY created_at DESC",
    [req.user!.id]
  );
  res.json(result.rows.map(withTrustState));
});

type PropertyTrustRow = {
  updated_at?: Date | string | null;
  created_at?: Date | string | null;
  last_verified_at?: Date | string | null;
  confidence_score?: number | string | null;
  verification_source?: string | null;
};

function withTrustState<T extends PropertyTrustRow>(property: T) {
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
