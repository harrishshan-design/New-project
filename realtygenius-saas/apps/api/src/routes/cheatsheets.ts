import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { requireAuth } from "../http/auth.js";
import { HttpError } from "../http/errors.js";
import { generateJson } from "../services/ai.js";
import { buildListingTrustState, validateAiOutputIntegrity } from "../services/survivalPolicy.js";

export const cheatsheetsRouter = Router();
cheatsheetsRouter.use(requireAuth);

type CheatSheetContent = {
  recentTransactions: Array<{ date: string; price: number; note: string }>;
  priceContext: string;
  keySellingPoints: string[];
  weaknesses: string[];
  objectionScripts: Array<{ objection: string; response: string }>;
  developerNote: string;
  trustContext: {
    confidenceScore: number;
    freshnessStatus: string;
    verificationSource: string;
    warnings: string[];
  };
  generatedBy: string;
};

type PropertyTrustRow = {
  id: string;
  updated_at?: Date | string | null;
  created_at?: Date | string | null;
  last_verified_at?: Date | string | null;
  confidence_score?: number | string | null;
  verification_source?: string | null;
};

cheatsheetsRouter.post("/", async (req, res) => {
  const body = z.object({
    propertyId: z.string().uuid(),
    buyerId: z.string().uuid().optional()
  }).parse(req.body);

  const property = await query(
    "SELECT * FROM properties WHERE id = $1 AND agent_id = $2",
    [body.propertyId, req.user!.id]
  );
  if (!property.rows[0]) throw new HttpError(404, "Property not found");

  const transactions = await query(
    "SELECT * FROM property_transactions WHERE property_id = $1 ORDER BY transacted_at DESC LIMIT 3",
    [body.propertyId]
  );
  const buyer = body.buyerId ? await query("SELECT * FROM buyers WHERE id = $1", [body.buyerId]) : { rows: [] };
  const propertyRow = property.rows[0] as PropertyTrustRow;
  const trustState = buildListingTrustState({
    updatedAt: propertyRow.updated_at || propertyRow.created_at,
    lastVerifiedAt: propertyRow.last_verified_at,
    confidenceScore: propertyRow.confidence_score,
    verificationSource: propertyRow.verification_source
  });
  const integrity = validateAiOutputIntegrity({ trustState, hasSourceTrace: transactions.rows.length > 0 });

  const content = await generateJson<CheatSheetContent>(
    [
      "Generate a mobile-first 30-second property viewing cheat sheet for a Malaysian property agent.",
      "Return JSON only with keys: recentTransactions, priceContext, keySellingPoints, weaknesses, objectionScripts, developerNote, trustContext, generatedBy.",
      "recentTransactions must be an array of {date, price, note}.",
      "objectionScripts must be an array of {objection, response}.",
      "Keep bullets short enough to read during a physical viewing.",
      "Never present stale, archived, or unverified pricing as certainty. Include the provided trustContext exactly enough for the UI to show confidence and freshness."
    ].join(" "),
    { property: property.rows[0], transactions: transactions.rows, buyer: buyer.rows[0], trustContext: integrity },
    {
      recentTransactions: transactions.rows.map((row) => ({
        date: String(row.transacted_at),
        price: Number(row.transacted_price),
        note: `${row.unit_size_sqft || "Comparable"} sqft comparable`
      })),
      priceContext: "Use recent comparable transactions to anchor the asking price and guide the offer range.",
      keySellingPoints: ["Strong location story", "Easy-to-understand comparable pricing", "Clear rental or own-stay appeal"],
      weaknesses: ["Confirm maintenance fee", "Compare condition against cheaper units", "Check developer and building upkeep"],
      objectionScripts: [
        {
          objection: "Price feels high",
          response: "Let's anchor against the last three transactions and adjust for condition, floor, and urgency."
        }
      ],
      developerNote: "Prepare one developer credibility point and one building upkeep caveat.",
      trustContext: {
        confidenceScore: integrity.outputConfidence,
        freshnessStatus: integrity.freshnessStatus,
        verificationSource: integrity.verificationSource,
        warnings: integrity.warnings
      },
      generatedBy: "OpenAI API"
    }
  );

  const saved = await query(
    "INSERT INTO viewing_cheat_sheets (agent_id, property_id, buyer_id, content) VALUES ($1,$2,$3,$4) RETURNING *",
    [req.user!.id, body.propertyId, body.buyerId, content]
  );
  res.status(201).json(saved.rows[0]);
});
