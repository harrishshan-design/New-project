import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { requireAuth, requireRole } from "../http/auth.js";
import { HttpError } from "../http/errors.js";
import { generateJson, getAiRuntimeStatus } from "../services/ai.js";
import { buildListingTrustState, validateAiOutputIntegrity } from "../services/survivalPolicy.js";

export const aiRouter = Router();
aiRouter.use(requireAuth);

type PropertyForAi = {
  id: string;
  title: string;
  area: string;
  address: string;
  property_type: string | null;
  asking_price: string;
  bedrooms: number | null;
  bathrooms: number | null;
  built_up_sqft: number | null;
  maintenance_fee: string | null;
  developer: string | null;
  image_url: string | null;
  created_at: string;
  updated_at?: string | null;
  last_verified_at?: string | null;
  confidence_score?: number | string | null;
  verification_source?: string | null;
};

async function recordGeneration(feature: string, input: unknown, output: unknown, startedAt: number, userId?: string) {
  await query(
    `INSERT INTO ai_generations (user_id, feature, provider, input_json, output_json, latency_ms)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      userId,
      feature,
      getAiRuntimeStatus().provider,
      input,
      output,
      Math.max(Date.now() - startedAt, 0)
    ]
  );
}

function trustFor(property: PropertyForAi) {
  const trustState = buildListingTrustState({
    updatedAt: property.updated_at || property.created_at,
    lastVerifiedAt: property.last_verified_at,
    confidenceScore: property.confidence_score,
    verificationSource: property.verification_source
  });
  return validateAiOutputIntegrity({ trustState, hasSourceTrace: Boolean(property.last_verified_at || property.verification_source) });
}

function deterministicRecommendationScore(property: PropertyForAi, profile: { area?: string; budgetMax?: number; propertyType?: string; bedrooms?: number }) {
  let score = 35;
  const reasons: string[] = [];
  const price = Number(property.asking_price);
  if (profile.area && property.area.toLowerCase().includes(profile.area.toLowerCase())) {
    score += 25;
    reasons.push("Area matches search intent");
  }
  if (profile.budgetMax && price <= profile.budgetMax) {
    score += 25;
    reasons.push("Within buyer budget");
  } else if (profile.budgetMax && price <= profile.budgetMax * 1.08) {
    score += 12;
    reasons.push("Slight budget stretch");
  }
  if (profile.propertyType && property.property_type === profile.propertyType) {
    score += 10;
    reasons.push("Property type match");
  }
  if (profile.bedrooms && Number(property.bedrooms || 0) >= profile.bedrooms) {
    score += 5;
    reasons.push("Bedroom requirement met");
  }
  return { score: Math.min(score, 100), reasons };
}

aiRouter.get("/status", async (_req, res) => {
  res.json(getAiRuntimeStatus());
});

aiRouter.post("/buyer-recommendation", requireRole("buyer", "agent", "admin", "master"), async (req, res) => {
  const startedAt = Date.now();
  const body = z.object({
    area: z.string().optional(),
    budgetMin: z.number().optional(),
    budgetMax: z.number().optional(),
    propertyType: z.string().optional(),
    bedrooms: z.number().int().optional(),
    limit: z.number().int().min(1).max(12).default(6)
  }).parse(req.body);

  const params: unknown[] = [];
  const conditions = ["p.archived_at IS NULL"];
  if (body.area) {
    params.push(`%${body.area}%`);
    conditions.push(`p.area ILIKE $${params.length}`);
  }
  if (body.budgetMax) {
    params.push(body.budgetMax * 1.1);
    conditions.push(`p.asking_price <= $${params.length}`);
  }
  if (body.propertyType) {
    params.push(body.propertyType);
    conditions.push(`p.property_type = $${params.length}`);
  }
  params.push(body.limit * 3);

  const properties = await query<PropertyForAi & { agent_name: string }>(
    `SELECT p.*, u.name agent_name
     FROM properties p
     JOIN users u ON u.id = p.agent_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY p.confidence_score DESC, p.updated_at DESC
     LIMIT $${params.length}`,
    params
  );

  const deterministic = properties.rows.map((property) => ({
    property,
    ...deterministicRecommendationScore(property, body),
    trust: trustFor(property)
  })).sort((a, b) => b.score - a.score).slice(0, body.limit);

  const output = await generateJson(
    "You are a Malaysian property buyer recommendation co-pilot. Return JSON with recommendations array. Each item must include propertyId, score, reasons, buyerFit, caution. Never hide trust warnings or stale data.",
    { buyerProfile: body, candidates: deterministic },
    {
      recommendations: deterministic.map((item) => ({
        propertyId: item.property.id,
        score: item.score,
        reasons: item.reasons,
        buyerFit: `${item.property.area} ${item.property.property_type || "property"} near buyer criteria`,
        caution: item.trust.warnings.join("; ") || "Review listing freshness before offer"
      }))
    }
  );

  await recordGeneration("buyer_recommendation", body, output, startedAt, req.user!.id);
  res.json({ ...output, runtime: getAiRuntimeStatus() });
});

aiRouter.post("/property-score", requireRole("agent", "admin", "master"), async (req, res) => {
  const startedAt = Date.now();
  const body = z.object({ propertyId: z.string().uuid() }).parse(req.body);

  const property = await query<PropertyForAi>(
    "SELECT * FROM properties WHERE id = $1 AND ($2::text IN ('admin','master') OR agent_id = $3)",
    [body.propertyId, req.user!.role, req.user!.id]
  );
  if (!property.rows[0]) throw new HttpError(404, "Property not found");

  const transactions = await query(
    "SELECT * FROM property_transactions WHERE property_id = $1 ORDER BY transacted_at DESC LIMIT 5",
    [body.propertyId]
  );
  const trust = trustFor(property.rows[0]);
  const averageComp = transactions.rows.length
    ? transactions.rows.reduce((sum, row) => sum + Number(row.transacted_price), 0) / transactions.rows.length
    : 0;
  const priceGapPercent = averageComp ? ((Number(property.rows[0].asking_price) - averageComp) / averageComp) * 100 : null;

  const output = await generateJson(
    "Score a Malaysian property listing as JSON with score, pricing, marketability, riskFlags, actionPlan. Respect freshness and confidence warnings.",
    { property: property.rows[0], transactions: transactions.rows, trust, averageComp, priceGapPercent },
    {
      score: Math.max(20, Math.min(100, Number(property.rows[0].confidence_score || 70) - Math.max(Math.abs(priceGapPercent || 0) - 8, 0))),
      pricing: { averageComparablePrice: averageComp || null, priceGapPercent },
      marketability: ["Location demand", "Comparable transaction support", "Agent verification quality"],
      riskFlags: trust.warnings,
      actionPlan: ["Refresh listing verification", "Add recent transaction evidence", "Update images and maintenance fee"]
    }
  );

  await recordGeneration("property_score", body, output, startedAt, req.user!.id);
  res.json({ ...output, trust, runtime: getAiRuntimeStatus() });
});

aiRouter.post("/negotiation-assistant", requireRole("buyer", "agent", "admin", "master"), async (req, res) => {
  const startedAt = Date.now();
  const body = z.object({
    threadId: z.string().uuid().optional(),
    propertyId: z.string().uuid().optional(),
    message: z.string().min(2).max(2500),
    targetOutcome: z.string().default("advance the deal while keeping agent in control")
  }).parse(req.body);

  const messages = body.threadId ? await query(
    `SELECT sender_role, body, offer_price, created_at
     FROM negotiation_messages nm
     JOIN negotiation_threads nt ON nt.id = nm.thread_id
     WHERE nm.thread_id = $1
       AND ($2::text IN ('admin','master') OR nt.buyer_user_id = $3 OR nt.agent_id = $3)
     ORDER BY nm.created_at DESC
     LIMIT 12`,
    [body.threadId, req.user!.role, req.user!.id]
  ) : { rows: [] };

  if (body.threadId && !messages.rows.length) {
    const access = await query("SELECT id FROM negotiation_threads WHERE id = $1", [body.threadId]);
    if (!access.rows[0]) throw new HttpError(404, "Negotiation not found");
  }

  const output = await generateJson(
    [
      "You are an AI negotiation assistant for Malaysian real estate.",
      "Return JSON with suggestedReply, tone, risks, nextActions, requiresAgentApproval.",
      "Do not finalize deals, do not negotiate autonomously, and do not send anything to the other party."
    ].join(" "),
    { role: req.user!.role, incomingMessage: body.message, targetOutcome: body.targetOutcome, recentThread: messages.rows.reverse() },
    {
      suggestedReply: "Thanks for the update. I will review the offer against recent comparable prices and come back with a clear next step.",
      tone: "professional",
      risks: ["Verify offer terms before accepting"],
      nextActions: ["Agent reviews draft", "Confirm price, timeline, and booking fee path inside the platform"],
      requiresAgentApproval: true
    }
  );

  if (body.threadId) {
    await query(
      `INSERT INTO negotiation_messages (thread_id, sender_user_id, sender_role, body, ai_payload)
       VALUES ($1,$2,'ai',$3,$4)`,
      [body.threadId, req.user!.id, String((output as { suggestedReply?: string }).suggestedReply || ""), output]
    );
  }

  await recordGeneration("negotiation_assistant", body, output, startedAt, req.user!.id);
  res.json({ ...output, runtime: getAiRuntimeStatus() });
});

aiRouter.post("/document-explanation", requireRole("buyer", "agent", "admin", "master"), async (req, res) => {
  const startedAt = Date.now();
  const body = z.object({
    documentId: z.string().uuid().optional(),
    extractedData: z.record(z.unknown()).optional(),
    ocrText: z.string().optional()
  }).parse(req.body);

  let source: unknown = { extractedData: body.extractedData, ocrText: body.ocrText };
  if (body.documentId) {
    if (req.user!.role === "buyer") throw new HttpError(403, "Buyer document explanation requires extractedData instead of direct document access");
    const document = await query(
      `SELECT d.type, d.extracted_json, d.ocr_text, d.processing_status, v.agent_id
       FROM buyer_documents d
       JOIN document_vaults v ON v.id = d.vault_id
       WHERE d.id = $1 AND ($2::text IN ('admin','master') OR v.agent_id = $3)`,
      [body.documentId, req.user!.role, req.user!.id]
    );
    if (!document.rows[0]) throw new HttpError(404, "Document not found");
    source = document.rows[0];
  }

  const output = await generateJson(
    "Explain Malaysian loan document OCR extraction as JSON with plainEnglishSummary, incomeSignals, commitmentSignals, missingItems, agentNextStep. Do not invent missing values.",
    source,
    {
      plainEnglishSummary: "The document has been read. Review extracted income and commitments before using the DSR result.",
      incomeSignals: [],
      commitmentSignals: [],
      missingItems: ["Confirm salary and monthly commitments if OCR confidence is low"],
      agentNextStep: "Ask the buyer to upload missing or clearer documents inside the secure vault."
    }
  );

  await recordGeneration("document_explanation", body, output, startedAt, req.user!.id);
  res.json({ ...output, runtime: getAiRuntimeStatus() });
});

aiRouter.post("/agent-cheat-sheet", requireRole("agent", "admin", "master"), async (req, res) => {
  const startedAt = Date.now();
  const body = z.object({
    propertyId: z.string().uuid(),
    buyerContext: z.record(z.unknown()).optional()
  }).parse(req.body);

  const property = await query<PropertyForAi>(
    "SELECT * FROM properties WHERE id = $1 AND ($2::text IN ('admin','master') OR agent_id = $3)",
    [body.propertyId, req.user!.role, req.user!.id]
  );
  if (!property.rows[0]) throw new HttpError(404, "Property not found");
  const transactions = await query(
    "SELECT * FROM property_transactions WHERE property_id = $1 ORDER BY transacted_at DESC LIMIT 3",
    [body.propertyId]
  );
  const trust = trustFor(property.rows[0]);

  const output = await generateJson(
    "Generate a 30-second mobile-first viewing cheat sheet as JSON with recentTransactions, topSellingPoints, weaknesses, objectionHandling, trustWarnings. Keep every bullet short.",
    { property: property.rows[0], transactions: transactions.rows, buyerContext: body.buyerContext, trust },
    {
      recentTransactions: transactions.rows.map((row) => ({ date: row.transacted_at, price: Number(row.transacted_price) })),
      topSellingPoints: ["Strong area fit", "Comparable pricing available", "Clear viewing narrative"],
      weaknesses: ["Verify maintenance fee", "Check condition against cheaper units"],
      objectionHandling: [{ objection: "Price is high", response: "Compare recent transactions, then adjust for floor, condition, and seller urgency." }],
      trustWarnings: trust.warnings
    }
  );

  await recordGeneration("agent_cheat_sheet", body, output, startedAt, req.user!.id);
  res.json({ ...output, runtime: getAiRuntimeStatus() });
});

aiRouter.post("/referral-message", requireRole("agent", "admin", "master"), async (req, res) => {
  const startedAt = Date.now();
  const body = z.object({
    campaignId: z.string().uuid().optional(),
    clientName: z.string().optional(),
    propertyTitle: z.string().optional(),
    estimatedValue: z.number().optional(),
    growthPercent: z.number().optional()
  }).parse(req.body);

  let source: unknown = body;
  if (body.campaignId) {
    const campaign = await query(
      `SELECT c.*, b.name buyer_name, p.title property_title
       FROM referral_campaigns c
       JOIN buyers b ON b.id = c.buyer_id
       JOIN closed_deals d ON d.id = c.deal_id
       JOIN properties p ON p.id = d.property_id
       WHERE c.id = $1 AND ($2::text IN ('admin','master') OR c.agent_id = $3)`,
      [body.campaignId, req.user!.role, req.user!.id]
    );
    if (!campaign.rows[0]) throw new HttpError(404, "Referral campaign not found");
    source = campaign.rows[0];
  }

  const output = await generateJson(
    "Draft a Malaysian property home-anniversary referral follow-up as JSON with whatsappDraft, emailSubject, emailBody, agentReminder. Keep it warm, specific, and not pushy.",
    source,
    {
      whatsappDraft: `Happy Home Anniversary${body.clientName ? `, ${body.clientName}` : ""}! Your property value looks healthier this year. I can send a quick valuation snapshot if useful.`,
      emailSubject: "Your RealtyGenius home anniversary valuation",
      emailBody: "Here is your annual property value snapshot and a quick view of what changed in the market.",
      agentReminder: "Review valuation numbers before sending."
    }
  );

  if (body.campaignId) {
    await query(
      `UPDATE referral_campaigns
       SET whatsapp_draft = $1, email_subject = $2, email_body = $3, status = 'drafted', drafted_at = NOW()
       WHERE id = $4`,
      [
        (output as { whatsappDraft?: string }).whatsappDraft,
        (output as { emailSubject?: string }).emailSubject,
        (output as { emailBody?: string }).emailBody,
        body.campaignId
      ]
    );
  }

  await recordGeneration("referral_message", body, output, startedAt, req.user!.id);
  res.json({ ...output, runtime: getAiRuntimeStatus() });
});
