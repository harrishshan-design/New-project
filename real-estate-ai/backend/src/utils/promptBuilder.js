function buildDealAlertPrompt(property) {
  return `
Analyze this property:

Price: ${property.price}
Location: ${property.location}
Size: ${property.size}
Nearby transactions: ${property.comparables}

Tasks:
1. Estimate fair price
2. Determine if undervalued
3. Give short explanation
`;
}

function buildPricePredictionPrompt(property) {
  return `
Analyze this Malaysian property and predict its likely fair price trend.

Property:
Price: ${property.price}
Location: ${property.location}
Size: ${property.size}
Bedrooms: ${property.bedrooms}
Nearby transactions: ${property.comparables}
Market signals: ${property.marketSignals}

Tasks:
1. Estimate fair market price today
2. Predict price in 12 months
3. Predict price in 24 months
4. Give a short actionable investment insight
`;
}

module.exports = { buildDealAlertPrompt, buildPricePredictionPrompt };
