const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      zipCode: { type: String },
    },
    specs: {
      bedrooms: Number,
      bathrooms: Number,
      sqft: Number,
      propertyType: { type: String, enum: ["House", "Condo", "Townhouse", "Land", "Commercial", "Apartment"] },
    },
    images: [{ type: String }],
    aiInsights: {
      marketSentiment: { type: String, enum: ["Undervalued", "Fair", "Overvalued"] },
      confidenceScore: Number,
      roiEstimate: Number,
      reasoning: String,
      lastAnalyzed: Date,
    },
    status: { type: String, enum: ["Available", "Pending", "Sold"], default: "Available" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
