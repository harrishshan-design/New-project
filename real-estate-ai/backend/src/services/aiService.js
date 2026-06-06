const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getPropertyInsights(property) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      marketSentiment: "Fair",
      confidenceScore: 80,
      roiEstimate: 5.5,
      reasoning: "Mocked insight (Missing OpenAI Key)",
      lastAnalyzed: new Date(),
    };
  }

  try {
    const prompt = `Analyze this Malaysian real estate property and provide insights:
Title: ${property.title}
Price: RM ${property.price}
Specs: ${JSON.stringify(property.specs)}
Location: ${JSON.stringify(property.location)}

Provide a JSON response with:
1. "marketSentiment" (must be "Undervalued", "Fair", or "Overvalued")
2. "confidenceScore" (number 1-100)
3. "roiEstimate" (estimated ROI percentage as a number)
4. "reasoning" (brief 1-2 sentence explanation)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert real estate AI analyst. Respond in valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("AI Insights Error:", error);
    throw new Error("Failed to generate AI insights");
  }
}

async function scoreLead(lead) {
  if (!process.env.OPENAI_API_KEY) return 50; // default score

  try {
    const prompt = `Score this lead for a real estate purchase from 1 to 100 based on likelihood to close.
Interest Level: ${lead.interest}
Property Views: ${lead.viewCount}
Booked Viewing: ${lead.bookedViewing}
Stayed over 2 minutes: ${lead.stayedOverTwoMinutes}

Provide ONLY a JSON object with:
"score" (number 1-100)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert real estate AI lead scorer. Respond in valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return Math.min(100, Math.max(0, result.score || 0));
  } catch (error) {
    console.error("AI Lead Score Error:", error);
    return 50; // fallback score
  }
}

module.exports = {
  getPropertyInsights,
  scoreLead,
};
