const crypto = require("crypto");

const DEMO_IMAGES = {
  "modern luxury": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=88",
  "minimalist condo": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=88",
  "malaysian family home": "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1600&q=88"
};

function stagingPrompt(style) {
  return `Transform this empty property room into a ${style} staged interior for Malaysian property marketing. Keep the original room structure, windows, doors, walls, and lighting realistic. Add sofa, table, lighting, decor, and clean premium real estate presentation.`;
}

function normalizeStyle(value) {
  const style = String(value || "modern luxury").trim().toLowerCase();
  return DEMO_IMAGES[style] ? style : "modern luxury";
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function readRawBody(req, limit = 12 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("Request body is too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function parseMultipart(buffer, contentType) {
  const boundary = String(contentType || "").match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundary) return { fields: {}, files: {} };

  const boundaryBuffer = Buffer.from(`--${boundary[1] || boundary[2]}`);
  const fields = {};
  const files = {};
  let start = buffer.indexOf(boundaryBuffer);

  while (start !== -1) {
    start += boundaryBuffer.length;
    if (buffer[start] === 45 && buffer[start + 1] === 45) break;
    if (buffer[start] === 13 && buffer[start + 1] === 10) start += 2;

    const headerEnd = buffer.indexOf(Buffer.from("\r\n\r\n"), start);
    if (headerEnd === -1) break;
    const headerText = buffer.slice(start, headerEnd).toString("utf8");
    let bodyStart = headerEnd + 4;
    let next = buffer.indexOf(boundaryBuffer, bodyStart);
    if (next === -1) break;
    let bodyEnd = next - 2;
    if (bodyEnd < bodyStart) bodyEnd = next;

    const name = (headerText.match(/name="([^"]+)"/i) || [])[1];
    const filename = (headerText.match(/filename="([^"]*)"/i) || [])[1];
    const mimeType = (headerText.match(/content-type:\s*([^\r\n]+)/i) || [])[1] || "application/octet-stream";
    if (name) {
      const value = buffer.slice(bodyStart, bodyEnd);
      if (filename !== undefined) {
        files[name] = { filename, mimeType, buffer: value };
      } else {
        fields[name] = value.toString("utf8");
      }
    }
    start = next;
  }

  return { fields, files };
}

function imageDataUrl(file) {
  if (!file || !file.buffer) return "";
  return `data:${file.mimeType || "image/png"};base64,${file.buffer.toString("base64")}`;
}

async function tryOpenAiImageEdit(file, style) {
  if (!process.env.OPENAI_API_KEY || !file || !file.buffer) return null;

  const form = new FormData();
  form.append("model", process.env.OPENAI_IMAGE_MODEL || "gpt-image-1");
  form.append("prompt", stagingPrompt(style));
  form.append("size", "1024x1024");
  form.append("image", new Blob([file.buffer], { type: file.mimeType || "image/png" }), file.filename || "room.png");

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: form
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || `OpenAI image edit failed with ${response.status}`);
  }

  const first = payload.data && payload.data[0];
  if (first?.b64_json) return `data:image/png;base64,${first.b64_json}`;
  if (first?.url) return first.url;
  return null;
}

function makeArProjectId() {
  return `ar_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

module.exports = {
  DEMO_IMAGES,
  imageDataUrl,
  json,
  makeArProjectId,
  normalizeStyle,
  parseMultipart,
  readRawBody,
  stagingPrompt,
  tryOpenAiImageEdit
};
