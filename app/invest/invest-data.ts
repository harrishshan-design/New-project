export type ScenarioKey = "conservative" | "base" | "optimistic";

export type InvestmentScenario = {
  label: string;
  annualGrowth: number;
  rentalYield: number;
  occupancy: number;
  note: string;
};

export type InvestmentOpportunity = {
  id: string;
  name: string;
  location: string;
  image: string;
  gallery: string[];
  propertyValue: number;
  minimumInvestment: number;
  slots: number;
  slotsFilled: number;
  targetHoldYears: number;
  targetRentalYield: number;
  status: "Open for interest" | "Coming soon" | "Waitlist";
  risk: "Medium" | "Medium-high";
  summary: string;
  thesis: string;
  propertyType: string;
  tenure: string;
  builtUp: string;
  projectedAnnualRent: number;
  annualCosts: number;
  scenarios: Record<ScenarioKey, InvestmentScenario>;
};

export const opportunities: InvestmentOpportunity[] = [
  {
    id: "mont-kiara-skyline",
    name: "Mont Kiara Skyline Residence",
    location: "Mont Kiara, Kuala Lumpur",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=86",
    gallery: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=86",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=84",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=84"
    ],
    propertyValue: 1250000,
    minimumInvestment: 10000,
    slots: 5,
    slotsFilled: 3,
    targetHoldYears: 5,
    targetRentalYield: 4.8,
    status: "Open for interest",
    risk: "Medium",
    summary: "An illustrative urban-residential opportunity near established international schools, retail and commuter links.",
    thesis: "The model tests stable long-term rental demand, disciplined acquisition pricing and a five-year review point. It is not a live offer and no property has been acquired for investors.",
    propertyType: "High-rise residence",
    tenure: "Freehold",
    builtUp: "1,326 sq ft",
    projectedAnnualRent: 60000,
    annualCosts: 15000,
    scenarios: {
      conservative: { label: "Conservative", annualGrowth: 0.5, rentalYield: 3.6, occupancy: 82, note: "Lower occupancy, softer rent and limited capital growth." },
      base: { label: "Base", annualGrowth: 2.5, rentalYield: 4.8, occupancy: 92, note: "Illustrative assumptions based on stable occupancy and moderate growth." },
      optimistic: { label: "Optimistic", annualGrowth: 4.0, rentalYield: 5.5, occupancy: 96, note: "Stronger rent and growth; this is not a promised outcome." }
    }
  },
  {
    id: "subang-family-courtyard",
    name: "Subang Family Courtyard",
    location: "SS15, Subang Jaya",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=86",
    gallery: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=86",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=84",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=84"
    ],
    propertyValue: 980000,
    minimumInvestment: 10000,
    slots: 5,
    slotsFilled: 1,
    targetHoldYears: 5,
    targetRentalYield: 4.2,
    status: "Coming soon",
    risk: "Medium",
    summary: "A sample landed-home strategy centred on established amenities and family rental demand in Subang Jaya.",
    thesis: "This preview demonstrates how acquisition, tenancy, maintenance and exit assumptions would be reviewed before an opportunity could be offered.",
    propertyType: "Landed terrace",
    tenure: "Freehold",
    builtUp: "1,920 sq ft",
    projectedAnnualRent: 42000,
    annualCosts: 12000,
    scenarios: {
      conservative: { label: "Conservative", annualGrowth: 0.5, rentalYield: 3.1, occupancy: 80, note: "Longer vacancy periods and limited price movement." },
      base: { label: "Base", annualGrowth: 2.2, rentalYield: 4.2, occupancy: 90, note: "Moderate occupancy, rent and capital growth assumptions." },
      optimistic: { label: "Optimistic", annualGrowth: 3.8, rentalYield: 5.0, occupancy: 95, note: "Stronger demand assumptions; not a promised outcome." }
    }
  },
  {
    id: "johor-medini-suites",
    name: "Medini Gateway Suites",
    location: "Iskandar Puteri, Johor",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=86",
    gallery: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=86",
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1200&q=84",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=84"
    ],
    propertyValue: 720000,
    minimumInvestment: 10000,
    slots: 5,
    slotsFilled: 0,
    targetHoldYears: 5,
    targetRentalYield: 5.1,
    status: "Waitlist",
    risk: "Medium-high",
    summary: "An illustrative southern growth-corridor strategy with greater vacancy and market-cycle sensitivity.",
    thesis: "The scenario highlights why projected yield cannot be considered alone: occupancy, operating costs, resale liquidity and local supply all need review.",
    propertyType: "Serviced residence",
    tenure: "Leasehold",
    builtUp: "980 sq ft",
    projectedAnnualRent: 37000,
    annualCosts: 11000,
    scenarios: {
      conservative: { label: "Conservative", annualGrowth: -0.5, rentalYield: 3.5, occupancy: 72, note: "Higher vacancy and a modest decline in indicative value." },
      base: { label: "Base", annualGrowth: 2.0, rentalYield: 5.1, occupancy: 88, note: "Stable demand with moderate long-term price movement." },
      optimistic: { label: "Optimistic", annualGrowth: 4.5, rentalYield: 6.0, occupancy: 94, note: "Stronger regional demand; not a promised outcome." }
    }
  }
];

export const formatRinggit = (value: number) =>
  new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0
  }).format(value);

export function getOpportunity(id: string) {
  return opportunities.find((opportunity) => opportunity.id === id);
}
