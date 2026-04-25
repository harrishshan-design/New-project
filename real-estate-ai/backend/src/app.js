require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const propertyRoutes = require("./routes/propertyRoutes");
const leadRoutes = require("./routes/leadRoutes");

const app = express();
const port = process.env.PORT || 5000;

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/real-estate-ai";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("API Running");
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "real-estate-ai-backend",
    port,
    aiConfigured: Boolean(process.env.OPENAI_API_KEY),
  });
});

app.use("/api/properties", propertyRoutes);
app.use("/api/leads", leadRoutes);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Real Estate AI backend listening on http://localhost:${port}`);
  });
}

module.exports = app;
