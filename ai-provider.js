'use strict';

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
const AI_PROVIDER = (process.env.AI_PROVIDER || 'openai').toLowerCase();

const HAS_OPENAI = !!process.env.OPENAI_API_KEY;
const HAS_ANTHROPIC = !!process.env.ANTHROPIC_API_KEY;

let openaiClient = null;
let anthropicClient = null;

function getOpenAI() {
    if (!openaiClient && HAS_OPENAI) {
        const { OpenAI } = require('openai');
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openaiClient;
}

function getAnthropic() {
    if (!anthropicClient && HAS_ANTHROPIC) {
        const Anthropic = require('@anthropic-ai/sdk');
        anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return anthropicClient;
}

function stripJsonFence(content) {
    return content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
}

async function callOpenAiJson({ system, user }) {
    const client = getOpenAI();
    if (!client) return null;

    const response = await client.chat.completions.create({
        model: OPENAI_MODEL,
        response_format: { type: 'json_object' },
        temperature: 0.2,
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: user }
        ]
    });

    return response.choices?.[0]?.message?.content || null;
}

async function callAnthropicJson({ system, user }) {
    const client = getAnthropic();
    if (!client) return null;

    const response = await client.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 4096,
        temperature: 0.2,
        system: `${system}\n\nRespond with valid JSON only, no prose or markdown fences.`,
        messages: [{ role: 'user', content: user }]
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    return textBlock ? textBlock.text : null;
}

// Tries the preferred provider first, falls back to the other one if it fails or isn't configured.
// Returns the raw JSON string content (not yet parsed), or null if neither provider produced output.
async function generateJsonContent({ system, user, provider }) {
    const preferred = provider || AI_PROVIDER;
    const order = preferred === 'anthropic' ? ['anthropic', 'openai'] : ['openai', 'anthropic'];

    for (const name of order) {
        try {
            const content = name === 'openai'
                ? await callOpenAiJson({ system, user })
                : await callAnthropicJson({ system, user });
            if (content) return stripJsonFence(content);
        } catch (error) {
            console.error(`[AI:${name}] request failed:`, error.message);
        }
    }

    return null;
}

module.exports = {
    HAS_OPENAI,
    HAS_ANTHROPIC,
    HAS_AI: HAS_OPENAI || HAS_ANTHROPIC,
    generateJsonContent
};
