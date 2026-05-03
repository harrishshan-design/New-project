import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: process.env.ENV_FILE || "../../.env" });
dotenv.config();

const optionalString = z.preprocess((value) => value === "" ? undefined : value, z.string().optional());
const optionalUrl = z.preprocess((value) => value === "" ? undefined : value, z.string().url().optional());

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(24),
  JWT_EXPIRES_IN: z.string().default("7d"),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  AWS_REGION: z.string().default("ap-southeast-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().default("realtygenius-documents"),
  AWS_TEXTRACT_ENABLED: z.coerce.boolean().default(false),
  AI_PROVIDER: z.enum(["auto", "pinokio", "openai", "fallback"]).default("auto"),
  PINOKIO_BASE_URL: optionalUrl,
  PINOKIO_API_KEY: optionalString,
  PINOKIO_MODEL: z.string().default("local-realtygenius"),
  PINOKIO_COMPLETIONS_PATH: z.string().default("/v1/chat/completions"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_FROM: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default("RealtyGenius <noreply@realtygenius.my>"),
  REFERRAL_CRON_ENABLED: z.coerce.boolean().default(true),
  REFERRAL_CRON_SCHEDULE: z.string().default("0 9 * * *")
});

export const env = schema.parse(process.env);
