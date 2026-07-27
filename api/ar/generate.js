const {
  DEMO_IMAGES,
  imageDataUrl,
  json,
  makeArProjectId,
  normalizeStyle,
  parseMultipart,
  readRawBody,
  stagingPrompt,
  tryOpenAiImageEdit
} = require("./_utils");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const raw = await readRawBody(req);
    const parsed = parseMultipart(raw, req.headers["content-type"]);
    const style = normalizeStyle(parsed.fields.style);
    const file = parsed.files.image;

    if (!file || !file.buffer || !file.buffer.length) {
      return json(res, 400, { error: "Upload a room image first." });
    }

    let imageUrl = "";
    let demoMode = true;
    let aiError = "";

    try {
      imageUrl = await tryOpenAiImageEdit(file, style);
      demoMode = !imageUrl;
    } catch (error) {
      aiError = error.message || "AI staging failed.";
    }

    if (!imageUrl) imageUrl = DEMO_IMAGES[style];

    return json(res, 200, {
      id: makeArProjectId(),
      imageUrl,
      sourceImageUrl: imageDataUrl(file).slice(0, 400000),
      style,
      prompt: stagingPrompt(style),
      demoMode,
      aiError,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    return json(res, 400, { error: error.message || "Could not generate AR staging." });
  }
};
