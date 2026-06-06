const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    propertyId: String,
    propertyTitle: String,
    location: String,
    interest: String,
    source: String,
    viewCount: {
      type: Number,
      default: 0,
    },
    stayedOverTwoMinutes: {
      type: Boolean,
      default: false,
    },
    bookedViewing: {
      type: Boolean,
      default: false,
    },
    hotLead: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    assignedAgent: String,
    whatsappMessage: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Lead", leadSchema);
