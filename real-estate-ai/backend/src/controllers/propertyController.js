const Property = require("../models/Property");
const { getPropertyInsights } = require("../services/aiService");

async function getProperties(_req, res) {
  try {
    const properties = await Property.find();
    res.json({
      success: true,
      data: properties,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getProperty(req, res) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: "Not found" });
    
    res.json({
      success: true,
      data: property,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getDealAlerts(_req, res) {
  try {
    // Arbitrary definition: highly undervalued ones
    const deals = await Property.find({ "aiInsights.marketSentiment": "Undervalued" }).limit(10);
    res.json({
      success: true,
      data: deals,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getPricePrediction(req, res) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: "Not found" });

    // Leverage AI for real-time insight
    const insights = await getPropertyInsights(property);
    
    // Save generated insight onto the property document
    property.aiInsights = insights;
    await property.save();

    res.json({
      success: true,
      data: property,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getProperties,
  getProperty,
  getDealAlerts,
  getPricePrediction,
};
