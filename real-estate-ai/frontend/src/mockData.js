export const mockDealAlerts = [
  {
    propertyId: "1",
    title: "Lakeview Condo Residences",
    location: "Bukit Jalil, Kuala Lumpur",
    askingPrice: 480000,
    fairPrice: 501667,
    percentageDifference: 4,
    status: "fairly-priced",
    badge: "Fair Price",
    message: "This property is trading close to current market value",
    aiSummary:
      "Bukit Jalil remains attractive for owner-occupiers and investors because transit and lifestyle demand keep resale liquidity healthy.",
  },
  {
    propertyId: "2",
    title: "Transit Condo Suites",
    location: "Cheras, Kuala Lumpur",
    askingPrice: 420000,
    fairPrice: 437667,
    percentageDifference: 4,
    status: "fairly-priced",
    badge: "Fair Price",
    message: "This property is trading close to current market value",
    aiSummary:
      "Cheras units near MRT nodes still perform well with practical end-user demand, making this a stable, volume-friendly market.",
  },
  {
    propertyId: "3",
    title: "Family Park Apartment",
    location: "Subang Jaya, Selangor",
    askingPrice: 560000,
    fairPrice: 598333,
    percentageDifference: 6,
    status: "fairly-priced",
    badge: "Fair Price",
    message: "This property is trading close to current market value",
    aiSummary:
      "Subang Jaya continues to hold value because mature amenities and education demand create steady upgrader interest.",
  },
  {
    propertyId: "4",
    title: "City Edge Serviced Residence",
    location: "Setapak, Kuala Lumpur",
    askingPrice: 390000,
    fairPrice: 417667,
    percentageDifference: 7,
    status: "fairly-priced",
    badge: "Fair Price",
    message: "This property is trading close to current market value",
    aiSummary:
      "Setapak remains rental-friendly thanks to student and young professional demand, which supports occupancy and cash flow resilience.",
  },
  {
    propertyId: "5",
    title: "Garden Terrace Home",
    location: "Shah Alam, Selangor",
    askingPrice: 730000,
    fairPrice: 761667,
    percentageDifference: 4,
    status: "fairly-priced",
    badge: "Fair Price",
    message: "This property is trading close to current market value",
    aiSummary:
      "Shah Alam family homes benefit from established community demand, making them a dependable long-hold segment.",
  },
];

export const mockHotLeads = [
  {
    id: "lead-1",
    name: "John Tan",
    phone: "60123456789",
    propertyId: "1",
    propertyTitle: "Lakeview Condo Residences",
    location: "Bukit Jalil, Kuala Lumpur",
    hotLead: true,
    score: 92,
    tags: ["repeat-viewer", "book-viewing", "hot-lead"],
    assignedAgent: { id: "agent-1", name: "Aina Property Team", phone: "60123456789" },
    whatsappMessage:
      "Hey John Tan, I saw you checked out a unit in Bukit Jalil, Kuala Lumpur. There is actually one slightly below market I can show you. Want details?",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "lead-2",
    name: "Sarah Lim",
    phone: "60129876543",
    propertyId: "4",
    propertyTitle: "City Edge Serviced Residence",
    location: "Setapak, Kuala Lumpur",
    hotLead: true,
    score: 78,
    tags: ["high-dwell-time", "hot-lead"],
    assignedAgent: { id: "agent-2", name: "Daniel Realty", phone: "60129876543" },
    whatsappMessage:
      "Hey Sarah Lim, I saw you checked out a unit in Setapak, Kuala Lumpur. There is actually one slightly below market I can show you. Want details?",
    updatedAt: new Date().toISOString(),
  },
];

export const mockCRM = {
  totalLeads: 14,
  hotLeads: 5,
  bookedViewing: 4,
  converted: 2,
  conversionRate: 14,
  distribution: [
    {
      id: "agent-1",
      name: "Aina Property Team",
      phone: "60123456789",
      totalLeads: 5,
      hotLeads: 2,
      converted: 1,
    },
    {
      id: "agent-2",
      name: "Daniel Realty",
      phone: "60129876543",
      totalLeads: 4,
      hotLeads: 2,
      converted: 1,
    },
    {
      id: "agent-3",
      name: "Sarah Homes",
      phone: "60137778899",
      totalLeads: 5,
      hotLeads: 1,
      converted: 0,
    },
  ],
  pipeline: {
    new: 6,
    contacted: 3,
    viewing: 3,
    negotiation: 1,
    closed: 1,
  },
};

export function createOfflineLead(alert, source, currentForm) {
  return {
    id: `offline-${alert.propertyId}`,
    name: currentForm.name || "Guest Buyer",
    phone: currentForm.phone || "",
    propertyId: alert.propertyId,
    propertyTitle: alert.title,
    location: alert.location,
    hotLead: source === "Get Exact Location + Agent Contact" || source === "book_viewing",
    score:
      source === "Get Exact Location + Agent Contact" || source === "book_viewing" ? 82 : 58,
    tags:
      source === "Get Exact Location + Agent Contact" || source === "book_viewing"
        ? ["book-viewing", "hot-lead"]
        : ["captured-lead"],
    assignedAgent: { id: "agent-1", name: "Aina Property Team", phone: "60123456789" },
    whatsappMessage: `Hey ${currentForm.name || "there"}, I saw you checked out a unit in ${
      alert.location
    }. There is actually one slightly below market I can show you. Want details?`,
    updatedAt: new Date().toISOString(),
  };
}
