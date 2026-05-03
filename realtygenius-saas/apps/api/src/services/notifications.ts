import nodemailer from "nodemailer";
import twilio from "twilio";
import { env } from "../config/env.js";
import { assertAgentControlledExecution, buildLiquidityRetentionAlternative } from "./survivalPolicy.js";

type DeliveryOptions = {
  agentApproved?: boolean;
  agentTriggered?: boolean;
};

function deliveryPolicy(options: DeliveryOptions, channel: "whatsapp" | "email") {
  const agentControl = assertAgentControlledExecution({
    actionType: "message",
    agentApproved: options.agentApproved,
    agentTriggered: options.agentTriggered
  });

  return {
    agentControl,
    liquidityRetention: buildLiquidityRetentionAlternative(channel)
  };
}

export async function sendWhatsApp(to: string, body: string, options: DeliveryOptions) {
  const policy = deliveryPolicy(options, "whatsapp");
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_WHATSAPP_FROM) {
    return { skipped: true, body, policy };
  }

  const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  const delivery = await client.messages.create({
    from: env.TWILIO_WHATSAPP_FROM,
    to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
    body
  });

  return { delivery, policy };
}

export async function sendEmail(to: string, subject: string, html: string, options: DeliveryOptions) {
  const policy = deliveryPolicy(options, "email");
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return { skipped: true, subject, html, policy };
  }

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
  });

  const delivery = await transport.sendMail({ from: env.EMAIL_FROM, to, subject, html });
  return { delivery, policy };
}
