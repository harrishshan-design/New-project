const properties = [
  {
    id: "1",
    title: "Lakeview Condo Residences",
    area: "Bukit Jalil",
    location: "Bukit Jalil, Kuala Lumpur",
    price: 480000,
    size: "900 sqft",
    bedrooms: 3,
    comparables: [500000, 510000, 495000],
    amenities: ["LRT", "Mall", "School"],
    marketSignals: "Strong upgrader demand and improving transit connectivity",
  },
  {
    id: "2",
    title: "Transit Condo Suites",
    area: "Cheras",
    location: "Cheras, Kuala Lumpur",
    price: 420000,
    size: "850 sqft",
    bedrooms: 2,
    comparables: [430000, 445000, 438000],
    amenities: ["MRT", "Retail", "Hospital"],
    marketSignals: "Stable owner-occupier demand with moderate rental activity",
  },
  {
    id: "3",
    title: "Family Park Apartment",
    area: "Subang Jaya",
    location: "Subang Jaya, Selangor",
    price: 560000,
    size: "1050 sqft",
    bedrooms: 3,
    comparables: [590000, 605000, 600000],
    amenities: ["BRT", "University", "Mall"],
    marketSignals: "Healthy upgrader demand supported by established amenities",
  },
  {
    id: "4",
    title: "City Edge Serviced Residence",
    area: "Setapak",
    location: "Setapak, Kuala Lumpur",
    price: 390000,
    size: "780 sqft",
    bedrooms: 2,
    comparables: [410000, 425000, 418000],
    amenities: ["LRT", "Retail", "Highway access"],
    marketSignals: "Strong tenant demand from students and young professionals",
  },
  {
    id: "5",
    title: "Garden Terrace Home",
    area: "Shah Alam",
    location: "Shah Alam, Selangor",
    price: 730000,
    size: "1650 sqft",
    bedrooms: 4,
    comparables: [760000, 775000, 750000],
    amenities: ["School", "Park", "Hospital"],
    marketSignals: "Steady family demand with room for gradual capital appreciation",
  },
];

function listProperties() {
  return properties;
}

function getPropertyById(id) {
  return properties.find((property) => property.id === String(id));
}

function normalizeComparable(value) {
  if (typeof value === "number") {
    return value;
  }

  return Number(String(value).replace(/[^0-9.]/g, ""));
}

function calculateFairPrice(property) {
  const comparableValues = (property.comparables || [])
    .map(normalizeComparable)
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!comparableValues.length) {
    return property.price;
  }

  const total = comparableValues.reduce((sum, value) => sum + value, 0);
  return Math.round(total / comparableValues.length);
}

function buildDealAlert(property) {
  const fairPrice = calculateFairPrice(property);
  const percentageDifference = Math.round(
    ((fairPrice - property.price) / fairPrice) * 100
  );
  const status =
    percentageDifference >= 10
      ? "undervalued"
      : percentageDifference <= -10
        ? "overpriced"
        : "fairly-priced";

  let badge = "Fair Price";
  if (status === "undervalued") {
    badge = "Hot Deal";
  } else if (status === "overpriced") {
    badge = "Above Market";
  }

  return {
    propertyId: property.id,
    title: property.title,
    location: property.location,
    askingPrice: property.price,
    fairPrice,
    percentageDifference,
    status,
    badge,
    message:
      status === "undervalued"
        ? `This property is ${percentageDifference}% below market value`
        : status === "overpriced"
          ? `This property is ${Math.abs(
              percentageDifference
            )}% above market value`
          : "This property is trading close to current market value",
  };
}

function listDealAlerts() {
  return properties.map(buildDealAlert);
}

function buildPricePrediction(property) {
  const fairPrice = calculateFairPrice(property);
  const oneYearPrice = Math.round(fairPrice * 1.04);
  const twoYearPrice = Math.round(fairPrice * 1.09);
  const roiPotential = Math.round(
    ((twoYearPrice - property.price) / property.price) * 100
  );

  return {
    propertyId: property.id,
    title: property.title,
    location: property.location,
    currentPrice: property.price,
    fairPrice,
    predictedPrice12Months: oneYearPrice,
    predictedPrice24Months: twoYearPrice,
    projectedROI: roiPotential,
    outlook: roiPotential >= 10 ? "high" : roiPotential >= 5 ? "medium" : "low",
  };
}

module.exports = {
  listProperties,
  getPropertyById,
  listDealAlerts,
  buildPricePrediction,
};
