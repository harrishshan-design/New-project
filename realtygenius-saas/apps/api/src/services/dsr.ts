export type ExtractedFinancials = {
  salary: number | null;
  commitments: number | null;
  netIncome: number | null;
  confidence: number;
  sourceHints: string[];
};

export type DsrResult = {
  income: number;
  commitments: number;
  netIncome: number;
  dsrPercent: number;
  eligibility: "approve" | "reject";
  readiness: "likely" | "not_qualified";
  reason: string;
};

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const normalized = value.replace(/rm/gi, "").replace(/,/g, "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function moneyNear(label: RegExp, text: string) {
  const match = text.match(label);
  if (!match?.index) return null;
  const window = text.slice(match.index, match.index + 120);
  const amount = window.match(/(?:RM\s*)?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]{4,}(?:\.[0-9]{2})?)/i);
  return amount ? asNumber(amount[1]) : null;
}

export function normalizeFinancialExtraction(raw: Record<string, unknown>, ocrText: string): ExtractedFinancials {
  const salary =
    asNumber(raw.salary) ??
    asNumber(raw.monthlyIncome) ??
    asNumber(raw.grossMonthlyIncome) ??
    moneyNear(/(?:salary|basic pay|gross income|monthly income|gaji)/i, ocrText);

  const commitments =
    asNumber(raw.commitments) ??
    asNumber(raw.monthlyDebt) ??
    asNumber(raw.existingCommitments) ??
    moneyNear(/(?:commitment|loan|instalment|installment|debt|hutang)/i, ocrText);

  const netIncome =
    asNumber(raw.netIncome) ??
    asNumber(raw.netPay) ??
    asNumber(raw.takeHomePay) ??
    moneyNear(/(?:net pay|net income|take home|gaji bersih)/i, ocrText) ??
    (salary !== null && commitments !== null ? Math.max(salary - commitments, 0) : null);

  return {
    salary,
    commitments,
    netIncome,
    confidence: asNumber(raw.confidence) ?? 0.45,
    sourceHints: Array.isArray(raw.sourceHints) ? raw.sourceHints.map(String) : []
  };
}

export function calculateDsr(financials: ExtractedFinancials): DsrResult | null {
  if (!financials.salary || financials.salary <= 0 || financials.commitments === null) {
    return null;
  }

  const dsrPercent = (financials.commitments / financials.salary) * 100;
  const eligibility = dsrPercent <= 60 ? "approve" : "reject";

  return {
    income: financials.salary,
    commitments: financials.commitments,
    netIncome: financials.netIncome ?? Math.max(financials.salary - financials.commitments, 0),
    dsrPercent: Number(dsrPercent.toFixed(2)),
    eligibility,
    readiness: eligibility === "approve" ? "likely" : "not_qualified",
    reason: eligibility === "approve"
      ? "DSR is at or below 60%, so the buyer is preliminarily loan eligible."
      : "DSR is above 60%, so the buyer should be treated as high-risk or rejected before viewing."
  };
}
