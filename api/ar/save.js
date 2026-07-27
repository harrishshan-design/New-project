const { json, makeArProjectId, readRawBody } = require("./_utils");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const raw = await readRawBody(req, 2 * 1024 * 1024);
    const payload = raw.length ? JSON.parse(raw.toString("utf8")) : {};
    const record = {
      id: payload.id || makeArProjectId(),
      imageUrl: payload.imageUrl || "",
      style: payload.style || "modern luxury",
      prompt: payload.prompt || "",
      furnitureModel: payload.furnitureModel || "/models/sofa.glb",
      savedAt: new Date().toISOString()
    };

    return json(res, 200, {
      ok: true,
      ...record,
      storage: "ephemeral-mvp"
    });
  } catch (error) {
    return json(res, 400, { error: error.message || "Could not save AR project." });
  }
};
