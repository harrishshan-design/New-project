import { Router } from "express";
import { env } from "../config/env.js";
import { query } from "../db/pool.js";
import { findAgentProfileByPhone, findProfileByEmail, normalizePhone, upsertProfile } from "../db/profiles.js";

export const telegramRouter = Router();

type TelegramUser = {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

type TelegramChat = {
  id?: number | string;
  title?: string;
  type?: string;
};

type TelegramMessage = {
  message_id?: number;
  date?: number;
  text?: string;
  caption?: string;
  from?: TelegramUser;
  chat?: TelegramChat;
  photo?: Array<{ file_id?: string }>;
  document?: { file_id?: string };
  contact?: { phone_number?: string };
};

type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
};

type TelegramProfile = {
  id: string;
  user_id: string | null;
  telegram_user_id: string;
  chat_id: string;
  chat_title: string | null;
  username: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  ren_id: string | null;
  agency_name?: string | null;
  onboarding_step: "full_name" | "email" | "phone" | "ren_id" | "complete";
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9][0-9\s-]{7,18}$/;

telegramRouter.post("/webhook", async (req, res) => {
  if (env.TELEGRAM_WEBHOOK_SECRET) {
    const secret = req.header("x-telegram-bot-api-secret-token");
    if (secret !== env.TELEGRAM_WEBHOOK_SECRET) {
      return res.status(401).json({ error: "Invalid Telegram webhook secret." });
    }
  }

  const update = req.body as TelegramUpdate;
  const message = update.message || update.edited_message || update.channel_post;
  if (!message?.chat?.id) return res.json({ ok: true, ignored: "no_message" });

  await storeRawMessage(update, message);

  const from = message.from || {};
  const telegramUserId = String(from.id || message.chat.id);
  const chatId = String(message.chat.id);
  const text = String(message.text || message.caption || "").trim();
  const profile = await getOrCreateProfile({ telegramUserId, chatId, message });

  if (profile.onboarding_step !== "complete") {
    const reply = await handleOnboarding(profile, text, message);
    await sendTelegramMessage(chatId, reply.text, reply.replyMarkup);
    return res.json({ ok: true, onboarding: true });
  }

  if (/^\/start\b/i.test(text)) {
    await sendTelegramMessage(chatId, uploadListingPrompt(profile), agentMenuKeyboard());
    return res.json({ ok: true, onboarding: false });
  }

  await sendTelegramMessage(
    chatId,
    "Great. Tap Start new listing or send/forward your property photos and listing details here. I will prepare it for RealityGenius admin review.",
    agentMenuKeyboard()
  );
  return res.json({ ok: true, onboarding: false });
});

async function storeRawMessage(update: TelegramUpdate, message: TelegramMessage) {
  const fileIds = [
    ...(message.photo || []).map((item) => item.file_id).filter(Boolean),
    message.document?.file_id
  ].filter(Boolean) as string[];

  await query(
    `INSERT INTO telegram_raw_messages (
       telegram_update_id, update_type, chat_id, chat_title, message_id, message_date,
       sender_id, sender_username, text, caption, telegram_file_ids, raw_payload
     )
     VALUES ($1,$2,$3,$4,$5,to_timestamp($6),$7,$8,$9,$10,$11,$12)
     ON CONFLICT (telegram_update_id) DO NOTHING`,
    [
      update.update_id || Date.now(),
      update.channel_post ? "channel_post" : update.edited_message ? "edited_message" : "message",
      message.chat?.id ? String(message.chat.id) : null,
      message.chat?.title || null,
      message.message_id || null,
      message.date || Math.floor(Date.now() / 1000),
      message.from?.id ? String(message.from.id) : null,
      message.from?.username || null,
      message.text || null,
      message.caption || null,
      fileIds,
      update
    ]
  );
}

async function getOrCreateProfile(input: {
  telegramUserId: string;
  chatId: string;
  message: TelegramMessage;
}) {
  const existing = await query<TelegramProfile>(
    "SELECT * FROM telegram_agent_profiles WHERE telegram_user_id = $1",
    [input.telegramUserId]
  );
  if (existing.rows[0]) return existing.rows[0];

  const from = input.message.from || {};
  const fullName = [from.first_name, from.last_name].filter(Boolean).join(" ").trim() || null;
  const created = await query<TelegramProfile>(
    `INSERT INTO telegram_agent_profiles (telegram_user_id, chat_id, chat_title, username, full_name)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [
      input.telegramUserId,
      input.chatId,
      input.message.chat?.title || null,
      from.username || null,
      fullName
    ]
  );
  return created.rows[0];
}

async function handleOnboarding(profile: TelegramProfile, text: string, message: TelegramMessage) {
  if (/^\/start\b/i.test(text)) {
    return {
      text: "Welcome to RealityGenius. Before you upload your first listing, I need a few details.\n\nWhat is your full name?",
      replyMarkup: removeKeyboard()
    };
  }

  if (profile.onboarding_step === "full_name") {
    if (text.length < 2) return { text: "Please send your full name first." };
    await updateProfile(profile.telegram_user_id, { full_name: text, onboarding_step: "email" });
    return { text: "Thanks. What is your email address?" };
  }

  if (profile.onboarding_step === "email") {
    if (!emailPattern.test(text)) return { text: "Please send a valid email address, for example name@example.com." };
    await updateProfile(profile.telegram_user_id, { email: text.toLowerCase(), onboarding_step: "phone" });
    return {
      text: "Got it. What is your phone / WhatsApp number?",
      replyMarkup: contactKeyboard()
    };
  }

  if (profile.onboarding_step === "phone") {
    const phoneInput = message.contact?.phone_number || text;
    if (!phonePattern.test(phoneInput)) {
      return {
        text: "Please send a valid phone number with country code if possible, for example +60123456789.",
        replyMarkup: contactKeyboard()
      };
    }
    await updateProfile(profile.telegram_user_id, { phone: normalizePhone(phoneInput), onboarding_step: "ren_id" });
    const updated = { ...profile, phone: normalizePhone(phoneInput), onboarding_step: "ren_id" as const };
    await resolveAgentUserForTelegramProfile(updated);
    return {
      text: "Last step: send your REN ID. If you do not have it now, tap Skip.",
      replyMarkup: replyKeyboard([[{ text: "Skip" }]])
    };
  }

  if (profile.onboarding_step === "ren_id") {
    const renId = /^skip$/i.test(text) ? null : text;
    await updateProfile(profile.telegram_user_id, {
      ren_id: renId,
      onboarding_step: "complete",
      onboarding_completed_at: new Date().toISOString()
    });
    const updated = { ...profile, ren_id: renId, onboarding_step: "complete" as const };
    await resolveAgentUserForTelegramProfile(updated);
    return { text: uploadListingPrompt(profile), replyMarkup: agentMenuKeyboard() };
  }

  return { text: uploadListingPrompt(profile), replyMarkup: agentMenuKeyboard() };
}

async function updateProfile(telegramUserId: string, updates: Record<string, string | null>) {
  const keys = Object.keys(updates);
  const assignments = keys.map((key, index) => `${key} = $${index + 2}`);
  await query(
    `UPDATE telegram_agent_profiles
     SET ${assignments.join(", ")}, updated_at = now()
     WHERE telegram_user_id = $1`,
    [telegramUserId, ...keys.map((key) => updates[key])]
  );
}

async function resolveAgentUserForTelegramProfile(profile: TelegramProfile) {
  const phone = normalizePhone(profile.phone || "");
  const email = String(profile.email || "").trim().toLowerCase();
  const existing = (phone ? await findAgentProfileByPhone(phone) : null) || (email ? await findProfileByEmail(email) : null);

  const profileJson = {
    source: "telegram_onboarding",
    telegramUserId: profile.telegram_user_id,
    telegramUsername: profile.username,
    telegramProfileId: profile.id,
    telegramLinkedAt: new Date().toISOString()
  };

  const name = profile.full_name || profile.username || "Telegram Agent";
  const agencyName = profile.agency_name || "RealityGenius Telegram Desk";
  const user = await upsertProfile({
    id: existing?.id,
    fullName: existing?.full_name || existing?.name || name,
    email: existing?.email || email || `telegram-${profile.telegram_user_id}@realitygenius.local`,
    phone: existing?.phone || phone,
    passwordHash: existing?.password_hash || `telegram-profile:${profile.telegram_user_id}`,
    role: "agent",
    status: existing?.status || "pending",
    agencyName: existing?.agency_name || agencyName,
    renId: existing?.ren_id || profile.ren_id || null,
    profileJson
  });
  await query("UPDATE telegram_agent_profiles SET user_id = $2, updated_at = now() WHERE id = $1", [profile.id, user.id]);
  return user;
}

function uploadListingPrompt(profile: Pick<TelegramProfile, "full_name">) {
  return `You're ready, ${profile.full_name || "agent"}.\n\nNow upload your listing:\n1. Send property photos.\n2. Send title, location, price, bedrooms, bathrooms, size, and description.\n3. RealityGenius will prepare it for admin review before it goes live.`;
}

function replyKeyboard(rows: Array<Array<{ text: string; request_contact?: boolean }>>) {
  return {
    keyboard: rows,
    resize_keyboard: true,
    one_time_keyboard: true
  };
}

function contactKeyboard() {
  return replyKeyboard([[{ text: "Share my phone", request_contact: true }]]);
}

function removeKeyboard() {
  return { remove_keyboard: true };
}

function agentMenuKeyboard() {
  return replyKeyboard([
    [{ text: "Start new listing" }],
    [{ text: "Reset signup" }]
  ]);
}

async function sendTelegramMessage(chatId: string, text: string, replyMarkup?: Record<string, unknown>) {
  if (!env.TELEGRAM_BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
      ...(replyMarkup ? { reply_markup: replyMarkup } : {})
    })
  }).catch(() => undefined);
}
