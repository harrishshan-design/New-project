const leads = [];

const AGENTS = [
  { id: "agent-1", name: "Aina Property Team", phone: "60123456789" },
  { id: "agent-2", name: "Daniel Realty", phone: "60129876543" },
  { id: "agent-3", name: "Sarah Homes", phone: "60137778899" },
];

let nextAgentIndex = 0;

function normalizePhone(phone) {
  return String(phone || "").replace(/[^\d+]/g, "");
}

function getNextAgent() {
  const agent = AGENTS[nextAgentIndex];
  nextAgentIndex = (nextAgentIndex + 1) % AGENTS.length;
  return agent;
}

function buildWhatsAppMessage(lead) {
  return `Hey ${lead.name}, I saw you checked out a unit in ${lead.location}.\n\nThere is actually one slightly below market I can show you.\n\nWant details?`;
}

function calculateLeadScore(lead) {
  let score = 20;

  if (lead.viewCount >= 3) {
    score += 35;
  } else {
    score += lead.viewCount * 8;
  }

  if (lead.bookedViewing) {
    score += 35;
  }

  if (lead.stayedOverTwoMinutes) {
    score += 25;
  }

  if (lead.source === "Download Full Report") {
    score += 10;
  }

  return Math.min(score, 100);
}

function buildTags(lead) {
  const tags = [];

  if (lead.viewCount >= 3) {
    tags.push("repeat-viewer");
  }

  if (lead.bookedViewing) {
    tags.push("book-viewing");
  }

  if (lead.stayedOverTwoMinutes) {
    tags.push("high-dwell-time");
  }

  if (lead.hotLead) {
    tags.push("hot-lead");
  }

  return tags;
}

function buildFollowUpSequence(lead) {
  return [
    {
      day: 1,
      stage: "Intro",
      message: `Hi ${lead.name}, thanks for checking out homes in ${lead.location}. I can shortlist the best-fit options for your budget today.`,
    },
    {
      day: 2,
      stage: "Property",
      message: `I found a property in ${lead.location} that fits your interest in ${lead.propertyTitle || "this area"}. Want the full comparison?`,
    },
    {
      day: 3,
      stage: "Urgency",
      message: `A few buyers are actively viewing units around ${lead.location}. If you want, I can lock in a viewing slot before the stronger units move.`,
    },
  ];
}

function enrichLead(lead) {
  const score = calculateLeadScore(lead);
  const hotLead =
    lead.viewCount >= 3 || Boolean(lead.bookedViewing) || Boolean(lead.stayedOverTwoMinutes);
  const assignedAgent = lead.assignedAgent || getNextAgent();

  return {
    ...lead,
    hotLead,
    score,
    status: lead.status || "new",
    tags: buildTags({ ...lead, hotLead }),
    assignedAgent,
    whatsappMessage: buildWhatsAppMessage(lead),
    followUpSequence: buildFollowUpSequence(lead),
    updatedAt: new Date().toISOString(),
  };
}

function listLeads() {
  return leads;
}

function createLead(input) {
  const lead = enrichLead({
    id: String(Date.now()),
    name: input.name || "Unknown",
    phone: normalizePhone(input.phone),
    propertyId: input.propertyId || "",
    propertyTitle: input.propertyTitle || "",
    location: input.location || "",
    interest: input.interest || "",
    source: input.source || "unlock-analysis",
    viewCount: Number(input.viewCount) || 0,
    stayedOverTwoMinutes: Boolean(input.stayedOverTwoMinutes),
    bookedViewing: Boolean(input.bookedViewing),
    converted: Boolean(input.converted),
    createdAt: new Date().toISOString(),
  });

  leads.unshift(lead);
  return lead;
}

function findLeadByPhoneAndProperty(phone, propertyId) {
  return leads.find(
    (lead) => lead.phone === normalizePhone(phone) && lead.propertyId === String(propertyId || "")
  );
}

function captureLead(input) {
  if (!input.name || !input.phone) {
    throw new Error("Name and phone are required");
  }

  const existingLead = findLeadByPhoneAndProperty(input.phone, input.propertyId);
  if (existingLead) {
    return updateLeadActivity(existingLead.id, input);
  }

  return createLead(input);
}

function updateLeadActivity(id, updates) {
  const leadIndex = leads.findIndex((lead) => lead.id === String(id));

  if (leadIndex === -1) {
    throw new Error("Lead not found");
  }

  const currentLead = leads[leadIndex];
  const nextLead = enrichLead({
    ...currentLead,
    ...updates,
    phone: updates.phone ? normalizePhone(updates.phone) : currentLead.phone,
    assignedAgent: updates.assignedAgent || currentLead.assignedAgent,
    status: updates.status || currentLead.status,
    converted: updates.converted !== undefined ? Boolean(updates.converted) : currentLead.converted,
    viewCount:
      updates.viewCount !== undefined
        ? Number(updates.viewCount)
        : currentLead.viewCount + (updates.eventType === "property_view" ? 1 : 0),
    stayedOverTwoMinutes:
      updates.stayedOverTwoMinutes !== undefined
        ? Boolean(updates.stayedOverTwoMinutes)
        : currentLead.stayedOverTwoMinutes || updates.eventType === "long_session",
    bookedViewing:
      updates.bookedViewing !== undefined
        ? Boolean(updates.bookedViewing)
        : currentLead.bookedViewing || updates.eventType === "book_viewing",
  });

  leads[leadIndex] = nextLead;
  return nextLead;
}

function recordLeadEvent(input) {
  if (!input.phone || !input.propertyId) {
    throw new Error("Phone and propertyId are required");
  }

  const existingLead = findLeadByPhoneAndProperty(input.phone, input.propertyId);
  if (!existingLead) {
    return captureLead({
      ...input,
      source: input.source || input.eventType || "event",
      viewCount: input.eventType === "property_view" ? 1 : 0,
      stayedOverTwoMinutes: input.eventType === "long_session",
      bookedViewing: input.eventType === "book_viewing",
    });
  }

  return updateLeadActivity(existingLead.id, input);
}

function listHotLeads() {
  return leads.filter((lead) => lead.hotLead).sort((a, b) => b.score - a.score);
}

function getLeadDistributionSummary() {
  return AGENTS.map((agent) => {
    const assignedLeads = leads.filter((lead) => lead.assignedAgent?.id === agent.id);
    const hotLeads = assignedLeads.filter((lead) => lead.hotLead).length;
    const converted = assignedLeads.filter((lead) => lead.converted).length;

    return {
      ...agent,
      totalLeads: assignedLeads.length,
      hotLeads,
      converted,
    };
  });
}

function getCRMStats() {
  const totalLeads = leads.length;
  const hotLeads = leads.filter((lead) => lead.hotLead).length;
  const converted = leads.filter((lead) => lead.converted).length;
  const bookedViewing = leads.filter((lead) => lead.bookedViewing).length;

  return {
    totalLeads,
    hotLeads,
    bookedViewing,
    converted,
    conversionRate: totalLeads ? Math.round((converted / totalLeads) * 100) : 0,
    distribution: getLeadDistributionSummary(),
    pipeline: {
      new: leads.filter((lead) => lead.status === "new").length,
      contacted: leads.filter((lead) => lead.status === "contacted").length,
      viewing: leads.filter((lead) => lead.status === "viewing").length,
      negotiation: leads.filter((lead) => lead.status === "negotiation").length,
      closed: leads.filter((lead) => lead.status === "closed").length,
    },
  };
}

module.exports = {
  listLeads,
  createLead,
  captureLead,
  recordLeadEvent,
  listHotLeads,
  getCRMStats,
  getLeadDistributionSummary,
};
