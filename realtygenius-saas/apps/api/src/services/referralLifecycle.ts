import { query } from "../db/pool.js";
import { generateJson } from "./ai.js";

type ReferralCampaignRow = {
  id: string;
  agent_id: string;
  buyer_id: string;
  anniversary_year: number;
  due_at: string;
  buyer_name: string;
  phone: string | null;
  email: string | null;
  property_title: string;
  area: string;
  property_type: string | null;
  closed_price: string;
};

export function estimatePropertyValue(params: {
  closedPrice: number;
  anniversaryYear: number;
  area?: string | null;
  propertyType?: string | null;
}) {
  const areaRates: Record<string, number> = {
    Bangsar: 0.052,
    "Mont Kiara": 0.046,
    "Bukit Jalil": 0.044,
    "Petaling Jaya": 0.04,
    "Desa ParkCity": 0.048
  };
  const typeBoost = params.propertyType === "Landed" ? 0.012 : params.propertyType === "Condo" ? 0.004 : 0;
  const annualGrowth = (params.area ? areaRates[params.area] : undefined) ?? 0.042;
  const growthRate = annualGrowth + typeBoost;
  const estimatedValue = Math.round(params.closedPrice * Math.pow(1 + growthRate, params.anniversaryYear));
  const growthPercent = Number((((estimatedValue - params.closedPrice) / params.closedPrice) * 100).toFixed(2));

  return {
    estimatedValue,
    growthPercent,
    annualGrowthPercent: Number((growthRate * 100).toFixed(2)),
    summary: `${params.area || "The area"} ${params.propertyType || "property"} value estimated using area momentum, property type, and anniversary age.`
  };
}

async function loadCampaign(campaignId: string, agentId?: string) {
  const params: unknown[] = [campaignId];
  const agentFilter = agentId ? "AND c.agent_id = $2" : "";
  if (agentId) params.push(agentId);

  const result = await query<ReferralCampaignRow>(
    `SELECT c.*, b.name buyer_name, b.phone, b.email, p.title property_title, p.area, p.property_type, d.closed_price
     FROM referral_campaigns c
     JOIN buyers b ON b.id = c.buyer_id
     JOIN closed_deals d ON d.id = c.deal_id
     JOIN properties p ON p.id = d.property_id
     WHERE c.id = $1 ${agentFilter}`,
    params
  );

  return result.rows[0];
}

export async function draftReferralCampaign(campaignId: string, agentId?: string) {
  const row = await loadCampaign(campaignId, agentId);
  if (!row) return null;

  const valuation = estimatePropertyValue({
    closedPrice: Number(row.closed_price),
    anniversaryYear: Number(row.anniversary_year),
    area: row.area,
    propertyType: row.property_type
  });

  const draft = await generateJson(
    "Create JSON referral autopilot output for Malaysia: valuationReport, whatsappDraft, emailSubject, emailBody. Keep WhatsApp warm and short. Keep email useful and agent-branded.",
    { ...row, ...valuation },
    {
      valuationReport: valuation,
      whatsappDraft: `Happy Home Anniversary ${row.buyer_name}! Your ${row.property_title} may now be worth around RM ${valuation.estimatedValue.toLocaleString("en-MY")}.`,
      emailSubject: `${row.property_title}: Your Year ${row.anniversary_year} Home Valuation Update`,
      emailBody: `<p>Happy Home Anniversary ${row.buyer_name}. Your property is estimated around RM ${valuation.estimatedValue.toLocaleString("en-MY")} based on current area momentum.</p>`
    }
  );

  const saved = await query(
    `UPDATE referral_campaigns
     SET estimated_value = $1,
         valuation_growth_percent = $2,
         valuation_report = $3,
         whatsapp_draft = $4,
         email_subject = $5,
         email_body = $6,
         status = 'drafted',
         drafted_at = NOW(),
         cron_last_checked_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [
      valuation.estimatedValue,
      valuation.growthPercent,
      draft.valuationReport,
      draft.whatsappDraft,
      draft.emailSubject,
      draft.emailBody,
      campaignId
    ]
  );

  return saved.rows[0];
}

export async function runReferralAutomation(agentId?: string) {
  const params: unknown[] = [];
  const agentFilter = agentId ? "AND agent_id = $1" : "";
  if (agentId) params.push(agentId);

  const due = await query<{ id: string }>(
    `SELECT id
     FROM referral_campaigns
     WHERE status = 'scheduled'
       AND due_at <= CURRENT_DATE
       ${agentFilter}
     ORDER BY due_at ASC
     LIMIT 100`,
    params
  );

  const drafted = [];
  for (const campaign of due.rows) {
    const result = await draftReferralCampaign(campaign.id, agentId);
    if (result) drafted.push(result);
  }

  await query(
    `UPDATE referral_campaigns
     SET cron_last_checked_at = NOW()
     WHERE status IN ('scheduled', 'drafted') ${agentFilter}`,
    params
  );

  return {
    checkedAt: new Date().toISOString(),
    draftedCount: drafted.length,
    drafted
  };
}
