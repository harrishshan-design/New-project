export type FreshnessStatus = "fresh" | "normal" | "faded" | "warning" | "archived";
export type VerificationSource = "agent" | "system" | "manual" | "unverified";
export type AiActionType = "recommendation" | "analysis" | "summary" | "draft" | "message" | "negotiation" | "closing";

export type ListingTrustInput = {
  updatedAt?: Date | string | null;
  lastVerifiedAt?: Date | string | null;
  confidenceScore?: number | string | null;
  verificationSource?: VerificationSource | string | null;
  now?: Date;
};

export type ListingTrustState = {
  freshnessStatus: FreshnessStatus;
  displayState: FreshnessStatus;
  confidenceScore: number;
  verificationSource: VerificationSource;
  freshnessTimestamp: string;
  warnings: string[];
};

const DAY_MS = 86_400_000;

const sourceConfidencePenalty: Record<VerificationSource, number> = {
  agent: 0,
  system: 5,
  manual: 15,
  unverified: 35
};

const freshnessConfidencePenalty: Record<FreshnessStatus, number> = {
  fresh: 0,
  normal: 5,
  faded: 15,
  warning: 30,
  archived: 50
};

export function normalizeVerificationSource(source?: string | null): VerificationSource {
  if (source === "agent" || source === "system" || source === "manual" || source === "unverified") return source;
  return "unverified";
}

export function clampConfidence(score?: number | string | null) {
  const parsed = Number(score);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

export function getFreshnessStatus(timestamp?: Date | string | null, now = new Date()): FreshnessStatus {
  if (!timestamp) return "archived";

  const updatedAt = new Date(timestamp);
  if (Number.isNaN(updatedAt.getTime())) return "archived";

  const ageDays = Math.max(0, (now.getTime() - updatedAt.getTime()) / DAY_MS);
  if (ageDays <= 3) return "fresh";
  if (ageDays <= 14) return "normal";
  if (ageDays <= 30) return "faded";
  if (ageDays <= 60) return "warning";
  return "archived";
}

export function adjustedConfidence(
  baseConfidence: number | string | null | undefined,
  freshnessStatus: FreshnessStatus,
  verificationSource: VerificationSource
) {
  return clampConfidence(
    clampConfidence(baseConfidence) -
      freshnessConfidencePenalty[freshnessStatus] -
      sourceConfidencePenalty[verificationSource]
  );
}

export function buildListingTrustState(input: ListingTrustInput): ListingTrustState {
  const source = normalizeVerificationSource(input.verificationSource);
  const freshnessTimestamp = input.lastVerifiedAt || input.updatedAt || null;
  const freshnessStatus = getFreshnessStatus(freshnessTimestamp, input.now);
  const confidenceScore = adjustedConfidence(input.confidenceScore ?? 70, freshnessStatus, source);
  const warnings: string[] = [];

  if (freshnessStatus === "faded") warnings.push("Listing data is aging and should be rechecked before strong recommendations.");
  if (freshnessStatus === "warning") warnings.push("Listing data is stale. Agent verification is required before presenting as current.");
  if (freshnessStatus === "archived") warnings.push("Listing data is archived. Do not present availability or pricing as current.");
  if (source === "unverified") warnings.push("Verification source is missing. Treat pricing and availability as unverified.");
  if (confidenceScore < 50) warnings.push("Confidence is low. Ask the agent to verify source data before acting.");

  return {
    freshnessStatus,
    displayState: freshnessStatus,
    confidenceScore,
    verificationSource: source,
    freshnessTimestamp: freshnessTimestamp ? new Date(freshnessTimestamp).toISOString() : new Date(0).toISOString(),
    warnings
  };
}

export function assertAgentControlledExecution(input: {
  actionType: AiActionType;
  agentTriggered?: boolean;
  agentApproved?: boolean;
}) {
  const blockedAutonomousActions: AiActionType[] = ["message", "negotiation", "closing"];
  const hasAgentControl = Boolean(input.agentTriggered || input.agentApproved);

  if (blockedAutonomousActions.includes(input.actionType) && !hasAgentControl) {
    throw new Error("AI cannot execute messaging, negotiation, or closing without explicit agent control.");
  }

  return {
    allowed: true,
    agentControlRequired: blockedAutonomousActions.includes(input.actionType),
    agentControlled: hasAgentControl
  };
}

export function validateAiOutputIntegrity(input: {
  trustState: ListingTrustState;
  outputConfidence?: number | string | null;
  hasSourceTrace?: boolean;
}) {
  const outputConfidence = adjustedConfidence(
    input.outputConfidence ?? input.trustState.confidenceScore,
    input.trustState.freshnessStatus,
    input.trustState.verificationSource
  );
  const valid = input.hasSourceTrace === true && outputConfidence >= 50 && input.trustState.freshnessStatus !== "archived";
  const warnings = [...input.trustState.warnings];

  if (!input.hasSourceTrace) warnings.push("AI output is missing source traceability.");
  if (!valid) warnings.push("AI output must be framed as uncertain until source data is verified.");

  return {
    valid,
    outputConfidence,
    freshnessStatus: input.trustState.freshnessStatus,
    verificationSource: input.trustState.verificationSource,
    warnings
  };
}

export function enforcePrimaryActionBudget(actions: string[]) {
  if (actions.length > 3) {
    throw new Error("UX simplicity law failed: each screen may expose at most three primary actions.");
  }
  return actions;
}

export function buildLiquidityRetentionAlternative(attemptedChannel: "whatsapp" | "email" | "external_chat" | "offline") {
  const alternatives = {
    whatsapp: "Keep this in RealtyGenius to preserve the deal timeline, AI summary, document checklist, and one-tap confirmation.",
    email: "Use the in-platform deal room so every attachment, offer, and decision stays tied to the transaction.",
    external_chat: "Move the discussion into the RealtyGenius deal room for faster structured replies and tracked next actions.",
    offline: "Log the offline update in RealtyGenius so the next agent action, documents, and timeline remain complete."
  };

  return {
    attemptedChannel,
    platformAlternative: alternatives[attemptedChannel],
    systemRule: "Leaving RealtyGenius must reduce deal efficiency."
  };
}

export function buildColdStartGate(input: {
  verifiedAgentCount: number;
  seededListingCount: number;
  averageResponseMinutes: number;
}) {
  const ready =
    input.verifiedAgentCount >= 30 &&
    input.seededListingCount > 0 &&
    input.averageResponseMinutes <= 5;

  return {
    readyForPublicLaunch: ready,
    requirements: {
      eliteVerifiedAgents: "30-50",
      seededSupply: "required",
      responseSlaMinutes: 5
    },
    current: input
  };
}

