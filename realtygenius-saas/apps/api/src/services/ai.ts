import OpenAI from "openai";
import { env } from "../config/env.js";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenAiCompatibleResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

let client: OpenAI | null = null;

function getOpenAI() {
  if (!client && env.OPENAI_API_KEY) {
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return client;
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function shouldUsePinokio() {
  return Boolean(env.PINOKIO_BASE_URL && (env.AI_PROVIDER === "auto" || env.AI_PROVIDER === "pinokio"));
}

function shouldUseOpenAI() {
  return Boolean(env.OPENAI_API_KEY && (env.AI_PROVIDER === "auto" || env.AI_PROVIDER === "openai"));
}

function buildMessages(system: string, input: unknown): ChatMessage[] {
  return [
    { role: "system", content: system },
    { role: "user", content: typeof input === "string" ? input : JSON.stringify(input) }
  ];
}

async function callPinokio(messages: ChatMessage[], jsonMode: boolean) {
  if (!shouldUsePinokio()) return null;

  const url = `${env.PINOKIO_BASE_URL}${normalizePath(env.PINOKIO_COMPLETIONS_PATH)}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (env.PINOKIO_API_KEY) headers.Authorization = `Bearer ${env.PINOKIO_API_KEY}`;

  const baseBody = {
    model: env.PINOKIO_MODEL,
    temperature: 0.2,
    messages
  };

  const attempts = jsonMode
    ? [{ ...baseBody, response_format: { type: "json_object" } }, baseBody]
    : [baseBody];

  for (const body of attempts) {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) continue;
    const data = await response.json() as OpenAiCompatibleResponse;
    const content = data.choices?.[0]?.message?.content;
    if (content) return content;
  }

  return null;
}

async function callOpenAI(messages: ChatMessage[], jsonMode: boolean) {
  if (!shouldUseOpenAI()) return null;
  const openai = getOpenAI();
  if (!openai) return null;

  const response = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    temperature: 0.2,
    ...(jsonMode ? { response_format: { type: "json_object" as const } } : {}),
    messages
  });

  return response.choices[0]?.message?.content || null;
}

function stripJsonFence(content: string) {
  return content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function parseJsonContent<T>(content: string): T {
  return JSON.parse(stripJsonFence(content)) as T;
}

export function getAiRuntimeStatus() {
  return {
    provider: env.AI_PROVIDER,
    pinokioConfigured: Boolean(env.PINOKIO_BASE_URL),
    openAiConfigured: Boolean(env.OPENAI_API_KEY),
    model: env.PINOKIO_BASE_URL && env.AI_PROVIDER !== "openai" ? env.PINOKIO_MODEL : env.OPENAI_MODEL
  };
}

export async function generateText(system: string, input: unknown, fallback: string): Promise<string> {
  if (env.AI_PROVIDER === "fallback") return fallback;
  const messages = buildMessages(system, input);

  try {
    const pinokio = await callPinokio(messages, false);
    if (pinokio) return pinokio;
  } catch {
    // Fall through to OpenAI or deterministic fallback.
  }

  try {
    const openai = await callOpenAI(messages, false);
    if (openai) return openai;
  } catch {
    // Fall through to deterministic fallback.
  }

  return fallback;
}

export async function generateJson<T>(system: string, input: unknown, fallback: T): Promise<T> {
  if (env.AI_PROVIDER === "fallback") return fallback;
  const messages = buildMessages(system, input);

  try {
    const pinokio = await callPinokio(messages, true);
    if (pinokio) return parseJsonContent<T>(pinokio);
  } catch {
    // Fall through to OpenAI or deterministic fallback.
  }

  try {
    const openai = await callOpenAI(messages, true);
    if (openai) return parseJsonContent<T>(openai);
  } catch {
    // Fall through to deterministic fallback.
  }

  return fallback;
}
