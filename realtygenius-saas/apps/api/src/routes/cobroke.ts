import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { requireAuth } from "../http/auth.js";
import { HttpError } from "../http/errors.js";
import { generateJson } from "../services/ai.js";

export const cobrokeRouter = Router();
cobrokeRouter.use(requireAuth);

type PropertyRow = {
  id: string;
  agent_id: string;
  title: string;
  area: string;
  asking_price: string;
  property_type: string | null;
};

type BuyerRow = {
  id: string;
  name: string;
  preferred_area: string | null;
  budget_min: string | null;
  budget_max: string | null;
  property_type: string | null;
  buyer_agent_id: string;
  buyer_agent_name: string;
};

function nearLocation(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  const nearby: Record<string, string[]> = {
    Bangsar: ["KL Sentral", "Mont Kiara", "Petaling Jaya"],
    "Mont Kiara": ["Bangsar", "Desa ParkCity", "KL Sentral"],
    "Bukit Jalil": ["Petaling Jaya", "Bangsar"],
    "Petaling Jaya": ["Bangsar", "Bukit Jalil"],
    "Desa ParkCity": ["Mont Kiara"]
  };
  return nearby[a]?.includes(b) || nearby[b]?.includes(a) || false;
}

function scoreMatch(property: PropertyRow, buyer: BuyerRow) {
  let score = 0;
  const reasons = [];
  const price = Number(property.asking_price);
  const maxBudget = Number(buyer.budget_max || 0);
  const propertyType = property.property_type || "Condo";

  if (property.area === buyer.preferred_area) {
    score += 45;
    reasons.push("Exact location match");
  } else if (nearLocation(property.area, buyer.preferred_area)) {
    score += 25;
    reasons.push("Nearby location fit");
  }

  if (maxBudget && price <= maxBudget) {
    score += 35;
    reasons.push("Within buyer budget");
  } else if (maxBudget && price <= maxBudget * 1.08) {
    score += 20;
    reasons.push("Negotiable budget gap");
  }

  if (!buyer.property_type || buyer.property_type === propertyType) {
    score += 20;
    reasons.push("Property type fit");
  } else if (["Condo", "Serviced Residence"].includes(buyer.property_type) && ["Condo", "Serviced Residence"].includes(propertyType)) {
    score += 10;
    reasons.push("Similar high-rise type");
  }

  return { score: Math.min(score, 100), reasons };
}

function fallbackAgreement(matchId: string) {
  return {
    reference: `CB-${matchId.slice(0, 8).toUpperCase()}`,
    commissionSplit: "50/50",
    jurisdiction: "Malaysia",
    terms: [
      "Listing agent and buyer agent agree to split gross professional fee equally at 50/50.",
      "Both parties agree not to circumvent each other, the buyer, or the property owner.",
      "Agreement becomes binding when both agents e-sign in RealtyGenius."
    ],
    eSign: {
      listingAgentSigned: false,
      buyerAgentSigned: false
    }
  };
}

cobrokeRouter.post("/scan", async (req, res) => {
  const body = z.object({ propertyId: z.string().uuid() }).parse(req.body);
  const listing = await query<PropertyRow>(
    "SELECT id, agent_id, title, area, asking_price, property_type FROM properties WHERE id = $1 AND agent_id = $2",
    [body.propertyId, req.user!.id]
  );
  const property = listing.rows[0];
  if (!property) throw new HttpError(404, "Property not found");

  const buyers = await query<BuyerRow>(
    `SELECT b.*, u.id buyer_agent_id, u.name buyer_agent_name
     FROM buyers b
     JOIN users u ON u.id = b.agent_id
     WHERE b.agent_id <> $1
       AND (
         b.preferred_area = $2
         OR $2 ILIKE '%' || COALESCE(b.preferred_area, '') || '%'
         OR COALESCE(b.preferred_area, '') ILIKE '%' || $2 || '%'
       )
       AND ($3 BETWEEN COALESCE(b.budget_min, 0) AND COALESCE(b.budget_max, 999999999)
            OR $3 <= COALESCE(b.budget_max, 0) * 1.08)
       AND (b.property_type IS NULL OR b.property_type = $4 OR (b.property_type IN ('Condo','Serviced Residence') AND $4 IN ('Condo','Serviced Residence')))`,
    [req.user!.id, property.area, property.asking_price, property.property_type || "Condo"]
  );

  const matches = [];
  for (const buyer of buyers.rows) {
    const deterministic = scoreMatch(property, buyer);
    if (deterministic.score < 45) continue;

    const ai = await generateJson<{ score?: number; rationale?: string }>(
      "Score Malaysian property co-broke fit as JSON: score 0-100 and rationale. Consider location, budget, property type, and agent-to-agent deal practicality.",
      { property, buyer, deterministic },
      { score: deterministic.score, rationale: deterministic.reasons.join(", ") }
    );
    const score = Math.max(deterministic.score, Number(ai.score || 0));
    const notification = {
      listingAgent: `Private match found for ${property.title}. ${buyer.buyer_agent_name} has a buyer profile that fits.`,
      buyerAgent: `Private co-broke opportunity found in ${property.area}. 50/50 agreement can be initiated.`,
      reasons: deterministic.reasons
    };

    const saved = await query(
      `INSERT INTO cobroke_matches (listing_agent_id, buyer_agent_id, property_id, buyer_id, match_score, rationale, agreement_json, notification_payload)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (listing_agent_id, buyer_agent_id, property_id, buyer_id)
       DO UPDATE SET match_score = EXCLUDED.match_score, rationale = EXCLUDED.rationale, notification_payload = EXCLUDED.notification_payload
       RETURNING *`,
      [
        req.user!.id,
        buyer.buyer_agent_id,
        property.id,
        buyer.id,
        score,
        ai.rationale || deterministic.reasons.join(", "),
        fallbackAgreement(property.id),
        notification
      ]
    );
    matches.push(saved.rows[0]);
  }

  res.status(201).json({ matches });
});

cobrokeRouter.post("/:id/invite", async (req, res) => {
  const agreement = await generateJson(
    "Create a concise JSON co-broke agreement for Malaysia with reference, commissionSplit, jurisdiction, parties, property, buyer, terms, and eSign.",
    { matchId: req.params.id },
    fallbackAgreement(req.params.id)
  );
  const result = await query(
    `UPDATE cobroke_matches SET status = 'invited', agreement_json = $1, agreement_reference = $2
     WHERE id = $3 AND (listing_agent_id = $4 OR buyer_agent_id = $4) RETURNING *`,
    [agreement, (agreement as { reference?: string }).reference || `CB-${req.params.id.slice(0, 8).toUpperCase()}`, req.params.id, req.user!.id]
  );
  if (!result.rows[0]) throw new HttpError(404, "Co-broke match not found");
  res.json(result.rows[0]);
});

cobrokeRouter.post("/:id/decision", async (req, res) => {
  const body = z.object({ decision: z.enum(["accepted", "declined"]) }).parse(req.body);
  const result = await query(
    `UPDATE cobroke_matches SET status = $1
     WHERE id = $2 AND (listing_agent_id = $3 OR buyer_agent_id = $3) RETURNING *`,
    [body.decision, req.params.id, req.user!.id]
  );
  if (!result.rows[0]) throw new HttpError(404, "Co-broke match not found");
  res.json(result.rows[0]);
});

cobrokeRouter.post("/:id/sign", async (req, res) => {
  const match = await query<{ listing_agent_id: string; buyer_agent_id: string }>(
    "SELECT listing_agent_id, buyer_agent_id FROM cobroke_matches WHERE id = $1 AND (listing_agent_id = $2 OR buyer_agent_id = $2)",
    [req.params.id, req.user!.id]
  );
  const row = match.rows[0];
  if (!row) throw new HttpError(404, "Co-broke match not found");

  const column = row.listing_agent_id === req.user!.id ? "listing_agent_signed_at" : "buyer_agent_signed_at";
  const result = await query(
    `UPDATE cobroke_matches
     SET ${column} = NOW(),
         status = CASE
           WHEN COALESCE(listing_agent_signed_at, CASE WHEN $1 = 'listing_agent_signed_at' THEN NOW() END) IS NOT NULL
            AND COALESCE(buyer_agent_signed_at, CASE WHEN $1 = 'buyer_agent_signed_at' THEN NOW() END) IS NOT NULL
           THEN 'signed'::cobroke_status
           ELSE 'accepted'::cobroke_status
         END
     WHERE id = $2
     RETURNING *`,
    [column, req.params.id]
  );

  res.json(result.rows[0]);
});

cobrokeRouter.get("/", async (req, res) => {
  const result = await query(
    `SELECT m.*, p.title property_title, p.property_type, b.name buyer_name, b.preferred_area, b.budget_max
     FROM cobroke_matches m
     JOIN properties p ON p.id = m.property_id
     JOIN buyers b ON b.id = m.buyer_id
     WHERE m.listing_agent_id = $1 OR m.buyer_agent_id = $1
     ORDER BY m.created_at DESC`,
    [req.user!.id]
  );
  res.json(result.rows);
});
