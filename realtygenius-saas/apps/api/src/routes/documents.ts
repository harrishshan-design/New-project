import { Router } from "express";
import { randomBytes } from "crypto";
import { z } from "zod";
import { query, transaction } from "../db/pool.js";
import { requireAuth } from "../http/auth.js";
import { HttpError } from "../http/errors.js";
import { createUploadUrl } from "../services/storage.js";
import { extractTextFromS3 } from "../services/ocr.js";
import { generateJson } from "../services/ai.js";
import { calculateDsr, normalizeFinancialExtraction } from "../services/dsr.js";

export const documentsRouter = Router();

const requiredDocumentTypes = ["ic", "payslip", "bank_statement"] as const;
const uploadSchema = z.object({
  fileName: z.string().min(1).max(180),
  contentType: z.string().refine((value) => ["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(value), "Unsupported file type"),
  type: z.enum(requiredDocumentTypes)
});

async function getActiveVault(token: string) {
  const result = await query<{
    id: string;
    buyer_id: string;
    agent_id: string;
    expires_at: string;
    buyer_name: string;
    buyer_phone: string;
    buyer_email: string | null;
  }>(
    `SELECT v.id, v.buyer_id, v.agent_id, v.expires_at, b.name buyer_name, b.phone buyer_phone, b.email buyer_email
     FROM document_vaults v
     JOIN buyers b ON b.id = v.buyer_id
     WHERE v.magic_token = $1
       AND v.revoked_at IS NULL
       AND v.expires_at > NOW()`,
    [token]
  );

  const vault = result.rows[0];
  if (!vault) throw new HttpError(404, "Magic link is invalid or expired");
  await query("UPDATE document_vaults SET last_accessed_at = NOW() WHERE id = $1", [vault.id]);
  return vault;
}

async function buildVaultSummary(vaultId: string, agentId?: string) {
  const vaultParams: unknown[] = [vaultId];
  const agentFilter = agentId ? "AND v.agent_id = $2" : "";
  if (agentId) vaultParams.push(agentId);

  const vault = await query(
    `SELECT v.*, b.name buyer_name, b.phone buyer_phone, b.email buyer_email, b.preferred_area
     FROM document_vaults v
     JOIN buyers b ON b.id = v.buyer_id
     WHERE v.id = $1 ${agentFilter}`,
    vaultParams
  );
  if (!vault.rows[0]) throw new HttpError(404, "Vault not found");

  const documents = await query(
    `SELECT id, type, original_name, mime_type, upload_status, processing_status, extracted_json, created_at, processed_at, processing_error
     FROM buyer_documents
     WHERE vault_id = $1
     ORDER BY created_at DESC`,
    [vaultId]
  );

  const dsr = await query(
    `SELECT * FROM dsr_assessments
     WHERE buyer_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [vault.rows[0].buyer_id]
  );

  return {
    vault: vault.rows[0],
    requiredDocuments: requiredDocumentTypes,
    documents: documents.rows,
    dsr: dsr.rows[0] || null
  };
}

documentsRouter.get("/public/vault/:token", async (req, res) => {
  const vault = await getActiveVault(req.params.token);
  res.json(await buildVaultSummary(vault.id));
});

documentsRouter.post("/public/vault/:token/uploads", async (req, res) => {
  const vault = await getActiveVault(req.params.token);
  const body = uploadSchema.parse(req.body);
  const upload = await createUploadUrl({
    agentId: vault.agent_id,
    buyerId: vault.buyer_id,
    fileName: body.fileName,
    contentType: body.contentType
  });

  const document = await query(
    `INSERT INTO buyer_documents (vault_id, buyer_id, type, s3_key, original_name, mime_type, upload_status)
     VALUES ($1,$2,$3,$4,$5,$6,'pending') RETURNING id, type, original_name, upload_status, processing_status`,
    [vault.id, vault.buyer_id, body.type, upload.key, body.fileName, body.contentType]
  );

  res.status(201).json({ document: document.rows[0], uploadUrl: upload.uploadUrl });
});

documentsRouter.post("/public/vault/:token/documents/:documentId/complete", async (req, res) => {
  const vault = await getActiveVault(req.params.token);
  const result = await query(
    `UPDATE buyer_documents
     SET upload_status = 'uploaded', processing_status = 'queued'
     WHERE id = $1 AND vault_id = $2
     RETURNING id, type, original_name, upload_status, processing_status`,
    [req.params.documentId, vault.id]
  );
  if (!result.rows[0]) throw new HttpError(404, "Document not found");
  res.json(result.rows[0]);
});

documentsRouter.post("/public/vault/:token/process", async (req, res) => {
  const vault = await getActiveVault(req.params.token);
  const summary = await processVault(vault.id, vault.buyer_id, vault.agent_id);
  res.json(summary);
});

documentsRouter.use(requireAuth);

documentsRouter.post("/buyers", async (req, res) => {
  const body = z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().email().optional(),
    preferredArea: z.string().optional(),
    budgetMin: z.number().optional(),
    budgetMax: z.number().optional()
  }).parse(req.body);

  const result = await query(
    `INSERT INTO buyers (agent_id, name, phone, email, preferred_area, budget_min, budget_max)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [req.user!.id, body.name, body.phone, body.email, body.preferredArea, body.budgetMin, body.budgetMax]
  );
  res.status(201).json(result.rows[0]);
});

documentsRouter.post("/vaults", async (req, res) => {
  const body = z.object({ buyerId: z.string().uuid() }).parse(req.body);
  const token = randomBytes(32).toString("base64url");
  const result = await query(
    `INSERT INTO document_vaults (buyer_id, agent_id, magic_token, expires_at)
     VALUES ($1,$2,$3,NOW() + INTERVAL '14 days') RETURNING *`,
    [body.buyerId, req.user!.id, token]
  );
  res.status(201).json({ ...result.rows[0], magicLink: `/vault/${token}` });
});

documentsRouter.get("/loan-files", async (req, res) => {
  const result = await query(
    `SELECT
       v.id vault_id,
       v.magic_token,
       v.expires_at,
       b.id buyer_id,
       b.name buyer_name,
       b.phone buyer_phone,
       COUNT(d.id)::int document_count,
       COUNT(d.id) FILTER (WHERE d.upload_status = 'uploaded')::int uploaded_count,
       latest.dsr_percent,
       latest.readiness,
       latest.notes
     FROM document_vaults v
     JOIN buyers b ON b.id = v.buyer_id
     LEFT JOIN buyer_documents d ON d.vault_id = v.id
     LEFT JOIN LATERAL (
       SELECT dsr_percent, readiness, notes
       FROM dsr_assessments da
       WHERE da.buyer_id = b.id
       ORDER BY created_at DESC
       LIMIT 1
     ) latest ON true
     WHERE v.agent_id = $1
     GROUP BY v.id, b.id, latest.dsr_percent, latest.readiness, latest.notes
     ORDER BY v.created_at DESC`,
    [req.user!.id]
  );
  res.json(result.rows);
});

documentsRouter.get("/vaults/:vaultId/summary", async (req, res) => {
  res.json(await buildVaultSummary(req.params.vaultId, req.user!.id));
});

documentsRouter.post("/vaults/:vaultId/process", async (req, res) => {
  const vault = await query<{ id: string; buyer_id: string; agent_id: string }>(
    "SELECT id, buyer_id, agent_id FROM document_vaults WHERE id = $1 AND agent_id = $2",
    [req.params.vaultId, req.user!.id]
  );
  if (!vault.rows[0]) throw new HttpError(404, "Vault not found");
  res.json(await processVault(vault.rows[0].id, vault.rows[0].buyer_id, vault.rows[0].agent_id));
});

async function processVault(vaultId: string, buyerId: string, agentId: string) {
  const documents = await query<{ id: string; type: string; s3_key: string }>(
    `SELECT id, type, s3_key
     FROM buyer_documents
     WHERE vault_id = $1 AND upload_status = 'uploaded'`,
    [vaultId]
  );

  const extractedDocs = [];
  for (const doc of documents.rows) {
    try {
      await query("UPDATE buyer_documents SET processing_status = 'processing', processing_error = NULL WHERE id = $1", [doc.id]);
      const ocrText = await extractTextFromS3(doc.s3_key);
      const raw = await generateJson<Record<string, unknown>>(
        "Extract Malaysian borrower financial data from OCR text as JSON. Return salary, commitments, netIncome, confidence, sourceHints. Salary is monthly income. Commitments are recurring monthly debt payments only.",
        { documentType: doc.type, ocrText },
        {}
      );
      const extracted = normalizeFinancialExtraction(raw, ocrText);
      const updated = await query(
        `UPDATE buyer_documents
         SET ocr_text = $1, extracted_json = $2, processing_status = 'processed', processed_at = NOW()
         WHERE id = $3
         RETURNING id, type, extracted_json`,
        [ocrText, extracted, doc.id]
      );
      extractedDocs.push(updated.rows[0]);
    } catch (error) {
      await query(
        "UPDATE buyer_documents SET processing_status = 'failed', processing_error = $1 WHERE id = $2",
        [error instanceof Error ? error.message : "OCR processing failed", doc.id]
      );
    }
  }

  const totals = extractedDocs.reduce((acc, doc) => {
    const data = doc.extracted_json as { salary?: number | null; commitments?: number | null; netIncome?: number | null };
    return {
      salary: Math.max(acc.salary, Number(data.salary || 0)),
      commitments: acc.commitments + Number(data.commitments || 0),
      netIncome: Math.max(acc.netIncome, Number(data.netIncome || 0))
    };
  }, { salary: 0, commitments: 0, netIncome: 0 });

  const dsr = calculateDsr({
    salary: totals.salary || null,
    commitments: totals.commitments || null,
    netIncome: totals.netIncome || null,
    confidence: extractedDocs.length ? 0.75 : 0,
    sourceHints: []
  });

  if (dsr) {
    await transaction(async (client) => {
      await client.query(
        `INSERT INTO dsr_assessments (buyer_id, agent_id, gross_monthly_income, existing_monthly_debt, proposed_installment, dsr_percent, readiness, notes)
         VALUES ($1,$2,$3,$4,0,$5,$6,$7)`,
        [buyerId, agentId, dsr.income, dsr.commitments, dsr.dsrPercent, dsr.readiness, `${dsr.eligibility.toUpperCase()}: ${dsr.reason}`]
      );
      await client.query(
        "UPDATE buyers SET monthly_income = $1, monthly_debt = $2 WHERE id = $3",
        [dsr.income, dsr.commitments, buyerId]
      );
    });
  }

  return buildVaultSummary(vaultId, agentId);
}
