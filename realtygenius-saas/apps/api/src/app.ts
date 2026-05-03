import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./http/errors.js";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { agentRouter } from "./routes/agent.js";
import { aiRouter } from "./routes/ai.js";
import { buyerRouter } from "./routes/buyer.js";
import { documentsRouter } from "./routes/documents.js";
import { itinerariesRouter } from "./routes/itineraries.js";
import { cobrokeRouter } from "./routes/cobroke.js";
import { cheatsheetsRouter } from "./routes/cheatsheets.js";
import { referralsRouter } from "./routes/referrals.js";
import { propertiesRouter } from "./routes/properties.js";

export const app = express();

app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 240 }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "realtygenius-api" }));
app.use("/api/auth", authRouter);
app.use("/api/buyer", buyerRouter);
app.use("/api/agent", agentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/ai", aiRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/itineraries", itinerariesRouter);
app.use("/api/cobroke", cobrokeRouter);
app.use("/api/cheatsheets", cheatsheetsRouter);
app.use("/api/referrals", referralsRouter);
app.use("/api/properties", propertiesRouter);

app.use(notFound);
app.use(errorHandler);
